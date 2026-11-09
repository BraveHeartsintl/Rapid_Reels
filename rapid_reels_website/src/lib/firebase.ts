import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

/**
 * Firebase web config. These values are public by design (they ship to every
 * browser), so the project defaults below are used when the NEXT_PUBLIC_*
 * env vars are not set (e.g. a fresh Vercel deployment). Env vars override them.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCWx_eHXp8YQanxbU0oz1BUZeCLiWzd7Vs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rapidreelnew-de86a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rapidreelnew-de86a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rapidreelnew-de86a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "583858856130",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:583858856130:web:c3a3b4addc2a797e1e5b5b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BKPJHC4F2E",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

/**
 * Firebase is initialised lazily so that server-side prerendering never
 * touches the SDK and a missing `.env.local` surfaces as a clear runtime error.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Missing Firebase env vars. Copy .env.example to .env.local and fill in values.",
    );
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getAuthInstance(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getStorageInstance(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

export function getFunctionsInstance(): Functions {
  return getFunctions(
    getFirebaseApp(),
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1",
  );
}
