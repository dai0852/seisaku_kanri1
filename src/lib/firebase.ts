
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
      if (!firebaseConfig.apiKey) {
        throw new Error('Firebase config is not set for local development. Please check your .env.local file.');
      }
      app = initializeApp(firebaseConfig);
    } 
    // For production (Firebase App Hosting), use server-side config
    else if (process.env.FIREBASE_WEBAPP_CONFIG) {
      const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      app = initializeApp(config);
    } 
    // Fallback for client-side rendering when server vars aren't available
    else {
      // Fetch config from our API route in development/client-side
      const res = await fetch('/api/firebase-config');
      const config = await res.json();
      if (config.error) {
        console.error('Failed to load Firebase config. Make sure the server environment variables are set.');
        throw new Error(`Failed to load Firebase config: ${config.error}`);
      }
      app = initializeApp(config);
    }
  }

  const auth = getAuth(app);
  const db = getFirestore(app);

  instances = { app, auth, db };
  return instances;
}
