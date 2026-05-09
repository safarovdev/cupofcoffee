'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<{ app: FirebaseApp; db: Firestore; auth: Auth } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Прямая конфигурация Firebase
      const config = {
        apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
        authDomain: "coffee-f4bc1.firebaseapp.com",
        projectId: "coffee-f4bc1",
        storageBucket: "coffee-f4bc1.firebasestorage.app",
        messagingSenderId: "847730890494",
        appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
        measurementId: "G-3XN7LXDTJJ"
      };
      
      console.log("Initializing Firebase with direct config");
      
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const db = getFirestore(app);
      const auth = getAuth(app);
      setServices({ app, db, auth });
      console.log("Firebase initialized successfully");
    } catch (err: any) {
      console.error("Firebase initialization failed:", err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-black text-primary uppercase">Конфигурация не найдена</h1>
          <p className="text-muted-foreground">Для работы базы данных и входа необходимо подключить Firebase в консоли.</p>
          <div className="bg-muted p-4 rounded-2xl text-[10px] font-mono break-all">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!services) {
    return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Загрузка AromaFlow...</div>;
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
