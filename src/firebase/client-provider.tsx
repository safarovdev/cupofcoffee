'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<{ app: FirebaseApp; db: Firestore; auth: Auth } | null>(null);

  useEffect(() => {
    try {
      if (!firebaseConfig.apiKey) {
        console.warn("Firebase API Key is missing. Please check your .env file.");
      }
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const auth = getAuth(app);
      setServices({ app, db, auth });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  if (!services) {
    return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Инициализация AromaFlow...</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={services.app}
      firestore={services.db}
      auth={services.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
