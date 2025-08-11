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
    // Use server-side config in production (App Hosting)
    if (process.env.FIREBASE_WEBAPP_CONFIG) {
      const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      app = initializeApp(config);
    } else {
      // Fetch config from our API route in development
      // Note: This fetch call is relative and will work on the client-side.
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