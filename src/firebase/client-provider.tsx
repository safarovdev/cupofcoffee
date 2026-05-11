'use client';

import React, { useEffect, useState } from 'react';
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
      // Используем конфиг из центрального файла
      console.log("CupOfCoffee Debug: Initializing Firebase App with Project ID:", firebaseConfig.projectId);
      
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const auth = getAuth(app);
      
      setServices({ app, db, auth });
      console.log("CupOfCoffee Debug: Firebase initialized successfully");
    } catch (err: any) {
      console.error("CupOfCoffee Debug: Firebase initialization failed:", err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-black text-primary uppercase">Ошибка конфигурации</h1>
          <p className="text-muted-foreground">Не удалось подключиться к Firebase. Проверьте консоль для подробностей.</p>
          <div className="bg-muted p-4 rounded-2xl text-[10px] font-mono break-all">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!services) {
    return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Запуск CupOfCoffee...</div>;
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
