import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";

export const OWNER_ADMIN_EMAIL = "homespanaz@gmail.com";

const SESSION_KEY = "spanaz-admin-session-v2";
const LEGACY_SESSION_KEY = "spanaz-admin-session-v1";

export type AdminSession = {
  email: string;
  localId: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function saveSession(session: AdminSession) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  }
  void getFirebaseAuth()
    .then((auth) => signOut(auth))
    .catch(() => undefined);
}

export function getStoredAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.localId !== "string" ||
      typeof parsed.idToken !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      clearAdminSession();
      return null;
    }

    return {
      email: parsed.email,
      localId: parsed.localId,
      idToken: parsed.idToken,
      refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : "",
      expiresAt: parsed.expiresAt,
    };
  } catch {
    clearAdminSession();
    return null;
  }
}

function friendlyAuthError(error: unknown) {
  const code = error instanceof Error && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/user-disabled":
      return "This owner account has been disabled.";
    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "Email/password login is not enabled in Firebase Authentication.";
    case "auth/unauthorized-domain":
      return "spanaz.ro is not authorized in Firebase Authentication.";
    default:
      return error instanceof Error ? error.message : "Authentication failed.";
  }
}

async function sessionFromCurrentUser(): Promise<AdminSession | null> {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;

  await user.reload();
  const email = normalizeEmail(user.email ?? "");
  if (email !== OWNER_ADMIN_EMAIL || !user.emailVerified) return null;

  const token = await user.getIdTokenResult(true);
  const session: AdminSession = {
    email,
    localId: user.uid,
    idToken: token.token,
    refreshToken: user.refreshToken,
    expiresAt: new Date(token.expirationTime).getTime(),
  };
  saveSession(session);
  return session;
}

export async function sendOwnerPasswordReset(email: string) {
  const normalized = normalizeEmail(email);
  if (normalized !== OWNER_ADMIN_EMAIL) {
    throw new Error("This email is not configured as the SPA NAZ owner account.");
  }

  const auth = await getFirebaseAuth();
  await sendPasswordResetEmail(auth, normalized);
}

export async function signInOwner(email: string, password: string): Promise<AdminSession> {
  const normalized = normalizeEmail(email);
  if (normalized !== OWNER_ADMIN_EMAIL) {
    throw new Error("This email is not configured as the SPA NAZ owner account.");
  }

  try {
    const auth = await getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, normalized, password);
    await credential.user.reload();

    if (normalizeEmail(credential.user.email ?? "") !== OWNER_ADMIN_EMAIL) {
      await signOut(auth);
      throw new Error("This Firebase account is not authorized for SPA NAZ administration.");
    }

    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user).catch(() => undefined);
      await signOut(auth);
      throw new Error(
        "Verify the owner email first. A new verification email has been requested.",
      );
    }

    const session = await sessionFromCurrentUser();
    if (!session) throw new Error("Could not create a verified owner session.");
    return session;
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export async function getValidAdminSession(): Promise<AdminSession | null> {
  try {
    const auth = await getFirebaseAuth();
    await auth.authStateReady();

    if (!auth.currentUser) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem(LEGACY_SESSION_KEY);
      }
      return null;
    }

    return await sessionFromCurrentUser();
  } catch {
    return null;
  }
}
