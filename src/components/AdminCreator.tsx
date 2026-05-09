'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCreator() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase immediately when component mounts
    const initFirebase = async () => {
      try {
        // Load Firebase modules dynamically
        const firebase = await import('firebase/app');
        const auth = await import('firebase/auth');
        const firestore = await import('firebase/firestore');
        
        const firebaseConfig = {
          apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
          authDomain: "coffee-f4bc1.firebaseapp.com",
          projectId: "coffee-f4bc1",
          storageBucket: "coffee-f4bc1.firebasestorage.app",
          messagingSenderId: "847730890494",
          appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
          measurementId: "G-3XN7LXDTJJ"
        };

        // Check if Firebase is already initialized
        if (!firebase.getApps().length) {
          firebase.initializeApp(firebaseConfig);
        }

        setFirebaseReady(true);
        console.log("Firebase initialized successfully");
      } catch (err: any) {
        console.error("Firebase initialization error:", err);
        setError(`Firebase initialization failed: ${err.message}`);
      }
    };

    initFirebase();
  }, []);

  const createAdminUser = async () => {
    if (!firebaseReady) {
      setError("Firebase is not ready yet. Please wait...");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Import Firebase modules
      const firebase = await import('firebase/app');
      const auth = await import('firebase/auth');
      const firestore = await import('firebase/firestore');

      // Get Firebase instances
      const app = firebase.getApp();
      const authInstance = auth.getAuth(app);
      const firestoreInstance = firestore.getFirestore(app);

      // Admin credentials
      const email = "admin@mail.com";
      const password = "admin123456";

      console.log("Creating admin user...");

      // Create user in Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(
        authInstance, 
        email, 
        password
      );
      const user = userCredential.user;
      
      console.log("User created in Auth:", user.uid);

      // Create user document in Firestore
      await firestore.setDoc(
        firestore.doc(firestoreInstance, "users", user.uid),
        {
          email: email,
          role: "admin",
          createdAt: new Date().toISOString(),
          isActive: true
        }
      );

      console.log("User document created in Firestore");

      setMessage(`✅ Администратор успешно создан!\n\n📧 Email: ${email}\n🔑 Пароль: ${password}\n\n⚠️ ВАЖНО: Смените пароль после первого входа!`);

    } catch (err: any) {
      console.error("Error creating admin user:", err);
      
      if (err.code === 'auth/email-already-in-use') {
        setMessage(`✅ Администратор уже существует!\n\n📧 Email: admin@mail.com\n🔑 Пароль: admin123456\n\nВы можете использовать эти данные для входа.`);
      } else {
        setError(`❌ Ошибка: ${err.message}\n\nКод ошибки: ${err.code || 'unknown'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '30px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      zIndex: 9999,
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        marginBottom: '20px', 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937'
      }}>
        🚀 Создание Администратора
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          padding: '10px',
          background: firebaseReady ? '#dcfce7' : '#fef3c7',
          border: `1px solid ${firebaseReady ? '#bbf7d0' : '#fde68a'}`,
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {firebaseReady ? '✅ Firebase готов к работе' : '⏳ Инициализация Firebase...'}
        </div>
      </div>

      <button 
        onClick={createAdminUser}
        disabled={loading || !firebaseReady}
        style={{
          width: '100%',
          padding: '15px',
          background: (loading || !firebaseReady) ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: (loading || !firebaseReady) ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
      >
        {loading ? '⏳ Создание...' : '🔧 Создать Администратора'}
      </button>
      
      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          whiteSpace: 'pre-line',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
