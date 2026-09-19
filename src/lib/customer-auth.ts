import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";

export type CustomerSession = {
  uid: string;
  email: string;
  emailVerified: boolean;
  idToken: string;
};

export async function subscribeToCustomerAuth(
  listener: (user: User | null) => void,
): Promise<Unsubscribe> {
  const auth = await getFirebaseAuth();
  return onAuthStateChanged(auth, listener);
}

export async function getCurrentCustomerSession(): Promise<CustomerSession | null> {
  const auth = await getFirebaseAuth();
  await auth.authStateReady();

  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email?.trim().toLowerCase() ?? "",
    emailVerified: user.emailVerified,
    idToken: await user.getIdToken(),
  };
}

export async function registerCustomer(email: string, password: string) {
  const auth = await getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(credential.user).catch(() => undefined);
  return credential;
}

export async function loginCustomer(email: string, password: string) {
  const auth = await getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function loginCustomerWithGoogle() {
  const auth = await getFirebaseAuth();
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function resendCustomerVerification() {
  const auth = await getFirebaseAuth();
  if (!auth.currentUser) {
    throw new Error("Sign in before requesting email verification.");
  }
  await sendEmailVerification(auth.currentUser);
}

export async function logoutCustomer() {
  const auth = await getFirebaseAuth();
  await signOut(auth);
}

export async function resetCustomerPassword(email: string) {
  const normalized = email.trim();
  if (!normalized) throw new Error("Enter your email address first.");

  const auth = await getFirebaseAuth();
  await sendPasswordResetEmail(auth, normalized);
}

export function customerAuthError(error: unknown) {
  const code = error instanceof Error && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/weak-password":
      return "Use a password with at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication. Add spanaz.ro to Firebase Authorized domains.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase yet.";
    case "auth/network-request-failed":
      return "Could not reach Firebase. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return error instanceof Error ? error.message : "Authentication failed.";
  }
}
