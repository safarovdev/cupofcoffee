'use client';

import React, { useState } from 'react';

export default function SimpleAdminCreator() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAdminUser = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Инициализация Firebase с правильной конфигурацией
      const firebase = await import('firebase/app');
      const auth = await import('firebase/auth');
      
      // Проверяем, не инициализирован ли уже Firebase
      if (!firebase.getApps().length) {
        const firebaseConfig = {
          apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
          authDomain: "coffee-f4bc1.firebaseapp.com",
          projectId: "coffee-f4bc1",
          storageBucket: "coffee-f4bc1.firebasestorage.app",
          messagingSenderId: "847730890494",
          appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
          measurementId: "G-3XN7LXDTJJ"
        };
        
        console.log("Initializing Firebase with config:", firebaseConfig);
        firebase.initializeApp(firebaseConfig);
      }

      const app = firebase.getApp();
      const authInstance = auth.getAuth(app);
      
      console.log("Firebase app initialized:", app.name);
      console.log("Auth instance created:", authInstance);

      // Создаем пользователя
      const email = "admin@mail.com";
      const password = "admin123456";

      console.log("Attempting to create user:", email);
      
      const userCredential = await auth.createUserWithEmailAndPassword(
        authInstance,
        email,
        password
      );
      
      const user = userCredential.user;
      console.log("User created successfully:", user.uid);

      setMessage(`✅ Администратор успешно создан!\n\n📧 Email: ${email}\n🔑 Пароль: ${password}\n\n⚠️ ВАЖНО: Смените пароль после первого входа!\n\nUID пользователя: ${user.uid}`);

    } catch (err: any) {
      console.error("Detailed error:", err);
      
      if (err.code === 'auth/email-already-in-use') {
        setMessage(`✅ Администратор уже существует!\n\n📧 Email: admin@mail.com\n🔑 Пароль: admin123456\n\nВы можете использовать эти данные для входа.`);
      } else if (err.code === 'auth/configuration-not-found') {
        setError(`❌ Ошибка конфигурации Firebase Auth!\n\nВозможные решения:\n1. Проверьте, что Email/Password аутентификация включена в Firebase Console\n2. Проверьте правильность authDomain в конфигурации\n3. Убедитесь, что проект Firebase правильно настроен\n\nКод ошибки: ${err.code}`);
      } else {
        setError(`❌ Ошибка: ${err.message}\n\nКод ошибки: ${err.code || 'unknown'}\n\nДетали: ${JSON.stringify(err, null, 2)}`);
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
      maxWidth: '600px',
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
        🔧 Создание Администратора
      </h2>
      
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#6b7280' }}>
        <p>Этот компонент создаст администратора для вашего кофейного приложения.</p>
        <p style={{ marginTop: '10px' }}>Если возникнет ошибка конфигурации, проверьте настройки Firebase Console.</p>
      </div>

      <button 
        onClick={createAdminUser}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          background: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
      >
        {loading ? '⏳ Создание...' : '🚀 Создать Администратора'}
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
          color: '#dc2626',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {error}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#4b5563'
      }}>
        <strong>Инструкция для Firebase Console:</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Откройте <a href="https://console.firebase.google.com/project/coffee-f4bc1/authentication/providers" target="_blank" style={{ color: '#3b82f6' }}>Firebase Console</a></li>
          <li>Перейдите в раздел Authentication → Sign-in method</li>
          <li>Включите Email/Password провайдер</li>
          <li>Сохраните настройки</li>
          <li>Попробуйте создать администратора снова</li>
        </ol>
      </div>
    </div>
  );
}
