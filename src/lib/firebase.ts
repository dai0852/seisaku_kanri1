
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let instances: FirebaseInstances | null = null;

export async function getFirebaseInstances(): Promise<FirebaseInstances> {
  if (instances) {
    return instances;
  }

  let app: FirebaseApp;
  if (getApps().length) {
    app = getApp();
  } else {
    // For local development, use client-side environment variables
    if (process.env.NODE_ENV === 'development') {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          const errorMessage = 'Firebase config is not set. Make sure you have a .env.local file with NEXT_PUBLIC_FIREBASE_ variables.';
          console.error(errorMessage);
          throw new Error(errorMessage);
      }
      app = initializeApp(firebaseConfig);
    } else {
      // For production (Firebase App Hosting), use server-side config
      if (process.env.FIREBASE_WEBAPP_CONFIG) {
        const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
        app = initializeApp(config);
      } else {
        const errorMessage = 'Firebase web app config not found in environment variables.';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  }

  const auth = getAuth(app);
  const db = getFirestore(app);

  instances = { app, auth, db };
  return instances;
}
