import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

let appPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;

export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (getApps().length > 0) return getApp();

  appPromise ??= getFirebasePublicConfig()
    .then(({ projectId, apiKey }) =>
      initializeApp({
        apiKey,
        authDomain: projectId + ".firebaseapp.com",
        projectId,
      }),
    )
    .catch((error) => {
      appPromise = null;
      throw error;
    });

  return appPromise;
}

export async function getFirebaseAuth(): Promise<Auth> {
  if (typeof window === "undefined") {
    throw new Error("Firebase Authentication is only available in the browser.");
  }

  authPromise ??= getFirebaseApp()
    .then(async (app) => {
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      await auth.authStateReady();
      return auth;
    })
    .catch((error) => {
      authPromise = null;
      throw error;
    });

  return authPromise;
}
