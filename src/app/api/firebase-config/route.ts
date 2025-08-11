
import { NextResponse } from 'next/server';

export function GET() {
  // This endpoint is no longer the primary way for the client to get config in local dev.
  // It is kept for potential server-side use, but the client now uses NEXT_PUBLIC_ vars directly.
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    return NextResponse.json({ error: 'Firebase server config is not set on the server.' }, { status: 500 });
  }

  return NextResponse.json(firebaseConfig);
}
