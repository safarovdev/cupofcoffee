'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySelectorProps {
  name?: string;
  placeholder?: string;
}

export function CategorySelector({ name, placeholder = "Выберите категорию" }: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        
        const config = {
          apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
          authDomain: "coffee-f4bc1.firebaseapp.com",
          projectId: "coffee-f4bc1",
          storageBucket: "coffee-f4bc1.firebasestorage.app",
          messagingSenderId: "847730890494",
          appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
          measurementId: "G-3XN7LXDTJJ"
        };
        
        const app = getApps().length > 0 ? getApp() : initializeApp(config);
        const firestore = getFirestore(app);
        
        const querySnapshot = await getDocs(collection(firestore, 'menu'));
        const uniqueCategories = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category) {
            uniqueCategories.add(data.category);
          }
        });
        
        setCategories(Array.from(uniqueCategories).sort());
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback categories
        setCategories(['coffee', 'tea', 'mojito', 'mojito-carafe', 'milkshakes', 'ice-cream', 'desserts', 'bakery']);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Названия категорий на русском
  const categoryNames: Record<string, string> = {
    'coffee': 'Кофе',
    'tea': 'Чай',
    'mojito': 'Мохито',
    'mojito-carafe': 'Мохито (Графин)',
    'milkshakes': 'Милкшейки',
    'ice-cream': 'Мороженое',
    'desserts': 'Десерты',
    'bakery': 'Выпечка'
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Загрузка категорий..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select name={name}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {categoryNames[category] || category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
