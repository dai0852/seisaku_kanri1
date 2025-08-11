
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let instances: FirebaseInstances | null = null;

function initializeFirebase(): FirebaseInstances {
    let app: FirebaseApp;

    if (getApps().length) {
        app = getApp();
    } else {
        // For local development, use client-side environment variables from .env.local
        if (process.env.NODE_ENV === 'development') {
            const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };
            if (!firebaseConfig.apiKey) {
                throw new Error('Firebase config is not set for local development. Please check your .env.local file.');
            }
            app = initializeApp(firebaseConfig);
        }
        // For production (Firebase App Hosting), use server-side config
        else if (process.env.FIREBASE_WEBAPP_CONFIG) {
            try {
                const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
                app = initializeApp(config);
            } catch (e) {
                 throw new Error('Failed to parse FIREBASE_WEBAPP_CONFIG.');
            }
        }
        else {
             throw new Error('Firebase config is not set. Environment variables are missing.');
        }
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
}


export function getFirebaseInstances(): Promise<FirebaseInstances> {
  if (!instances) {
    instances = initializeFirebase();
  }
  return Promise.resolve(instances);
}
