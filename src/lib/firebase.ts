
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
    if (typeof window === "undefined") {
        // This should not happen in a well-configured client-side app,
        // but as a safeguard, we prevent server-side execution without config.
        throw new Error("Firebase cannot be initialized on the server without configuration.");
    }
    
    let app: FirebaseApp;

    if (getApps().length) {
        app = getApp();
    } else {
        // For production (Firebase App Hosting), Firebase provides config via reserved env vars.
        // These are substituted at build time, so they are available on the client.
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (!firebaseConfig.apiKey) {
            throw new Error('Firebase config is not set. Please check your environment variables.');
        }
        app = initializeApp(firebaseConfig);
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
