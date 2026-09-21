import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Firestore is used as the durable, multi-instance-safe store in production
// (e.g. Vercel), where the local filesystem is read-only/ephemeral. Credentials
// come from a Firebase service account, supplied via environment variables.

export function isFirestoreConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

let db: Firestore | null = null;

export function getDb(): Firestore {
  if (db) {
    return db;
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel stores the multi-line key with escaped newlines; restore them.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
      })
    });
  }

  db = getFirestore();
  return db;
}
