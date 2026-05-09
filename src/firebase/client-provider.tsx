'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const services = useMemo(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  }, []);

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
