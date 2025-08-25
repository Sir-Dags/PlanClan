
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';


interface AppUser extends User {
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithMicrosoft: async () => {},
  signUpWithEmail: async (email, pass) => {},
  signInWithEmail: async (email, pass) => {},
  signOut: async () => {},
});

const MAX_ADMINS = 2;

async function getOrCreateUser(firebaseUser: User): Promise<AppUser> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        return { ...firebaseUser, isAdmin: userData.isAdmin || false };
    } else {
        const usersRef = collection(db, 'users');
        const adminQuery = query(usersRef, where('isAdmin', '==', true), limit(MAX_ADMINS));
        const adminSnapshot = await getDocs(adminQuery);
        
        const isAdmin = adminSnapshot.size < MAX_ADMINS;

        const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: isAdmin,
            createdAt: new Date(),
        };
        await setDoc(userRef, newUser);
        return { ...firebaseUser, isAdmin };
    }
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await getOrCreateUser(firebaseUser);
        setUser(appUser);
        setLoading(false);
        router.push('/dashboard');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const handleSignInSuccess = (userCredential: UserCredential) => {
    // The onAuthStateChanged listener will handle user creation and routing
  }
  
  const handleAuthError = (error: any) => {
    // Don't throw an error if the user closes the popup.
    if (error.code === 'auth/popup-closed-by-user') {
      return;
    }
    console.error("Authentication error:", error);
    throw error;
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      handleSignInSuccess(userCredential);
    } catch (error) {
      handleAuthError(error);
    }
  };
  
  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      handleSignInSuccess(userCredential);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signInWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    try {
      const userCredential = await signInWithPopup(auth, provider);
      handleSignInSuccess(userCredential);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      handleSignInSuccess(userCredential);
    } catch (error) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      handleSignInSuccess(userCredential);
    } catch (error) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = { user, loading, signInWithGoogle, signInWithFacebook, signInWithMicrosoft, signUpWithEmail, signInWithEmail, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
