'use client';

import React, { useState } from 'react';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function CreateAdminUser() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAdminUser = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Initialize Firebase directly with config
      const { initializeApp } = await import('firebase/app');
      const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      
      const firebaseConfig = {
        apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
        authDomain: "coffee-f4bc1.firebaseapp.com",
        projectId: "coffee-f4bc1",
        storageBucket: "coffee-f4bc1.firebasestorage.app",
        messagingSenderId: "847730890494",
        appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
        measurementId: "G-3XN7LXDTJJ"
      };
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      
      // Admin user credentials
      const email = "admin@mail.com";
      const password = "admin123456";

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore with admin role
      await setDoc(doc(firestore, "users", user.uid), {
        email: email,
        role: "admin",
        createdAt: new Date().toISOString(),
        isActive: true
      });

      setMessage(`Admin user created successfully!\nEmail: ${email}\nPassword: ${password}\nIMPORTANT: Change the password after first login!`);

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setMessage('Admin user already exists. You can login with:\nEmail: admin@mail.com\nPassword: admin123456');
      } else {
        setError(`Error: ${err.message}`);
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
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h2>Create Admin User</h2>
      <button 
        onClick={createAdminUser}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Creating...' : 'Create Admin User'}
      </button>
      
      {message && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
