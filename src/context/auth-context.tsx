"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import { getFirebaseInstances } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { FullPageLoader } from '@/components/full-page-loader';

interface AuthContextType {
  user: User | null;
  approved: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseInstances, setFirebaseInstances] = useState<{ auth: Auth; db: Firestore } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getFirebaseInstances().then(setFirebaseInstances).catch(error => {
      console.error("Firebase initialization failed:", error);
      setLoading(false); // Stop loading if firebase fails to initialize
    });
  }, []);

  useEffect(() => {
    if (!firebaseInstances) return;

    const { auth } = firebaseInstances;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      if (!firebaseUser) {
        setApproved(false);
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, [firebaseInstances]);

  useEffect(() => {
    if (!user || !firebaseInstances) {
      if (!user) {
        setLoading(false);
      }
      return;
    };

    const { db } = firebaseInstances;
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().approved) {
        setApproved(true);
      } else {
        setApproved(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user approval status:", error);
      setApproved(false);
      setLoading(false);
    });
    
    return () => {
      unsubscribeFirestore();
    };
  }, [user, firebaseInstances]);
  
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const value = { user, approved, loading };

  if (loading || !firebaseInstances) {
    return <FullPageLoader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
