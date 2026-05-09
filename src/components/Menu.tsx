"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2, Database } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  category: string;
  rating: number;
  time: string;
  sizes?: { [key: string]: number };
};

export function Menu() {
  const { searchQuery } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
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
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setMenuItems(items);
        
        // Извлекаем уникальные категории из товаров
        const uniqueCategories = new Map();
        items.forEach((item: any) => {
          if (item.category && !uniqueCategories.has(item.category)) {
            uniqueCategories.set(item.category, item.category);
          }
        });
        
        // Определенный порядок категорий
        const categoryOrder = ['coffee', 'tea', 'mojito', 'mojito-carafe', 'milkshakes', 'ice-cream', 'desserts', 'bakery'];
        
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
        
        // Создаем массив категорий в правильном порядке
        const categoriesArray = Array.from(uniqueCategories.keys())
          .map(catId => ({
            id: catId,
            name: categoryNames[catId] || catId
          }))
          .sort((a, b) => {
            const aIndex = categoryOrder.indexOf(a.id);
            const bIndex = categoryOrder.indexOf(b.id);
            
            // Если обе категории в списке порядка, сортируем по порядку
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            
            // Если только одна категория в списке порядка, она идет первой
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            // Если обе категории не в списке порядка, сортируем по имени
            return a.name.localeCompare(b.name);
          });
        
        setCategories(categoriesArray);
        console.log(`Loaded ${items.length} menu items and ${categoriesArray.length} categories`);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const items = useMemo(() => {
    if (loading) return [];
    if (!menuItems || menuItems.length === 0) return [];
    return menuItems as MenuItem[];
  }, [menuItems, loading]);

  const applyFilters = (itemList: MenuItem[]) => {
    return itemList.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || 
               item.ingredients.some(i => i.toLowerCase().includes(q));
      }
      return true;
    });
  };

  if (loading && !menuItems) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm font-bold uppercase tracking-widest">Загрузка меню...</p>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Меню загружается...</p>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (activeCategory && !searchQuery) {
    const categoryName = categories.find((c: any) => c.id === activeCategory)?.name || "";
    const filteredItems = items.filter(i => i.category === activeCategory);

    return (
      <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 px-4 sm:px-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-muted/50"
            onClick={() => setActiveCategory(null)}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-3xl font-black font-headline text-primary uppercase tracking-tighter leading-none">
              {categoryName}
            </h2>
            <div className="h-1 w-12 bg-primary/20 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-1">
          {filteredItems.map((item) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-12">
      {!menuItems || menuItems.length === 0 ? (
        <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex items-center justify-between gap-4 mx-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-accent" />
            <p className="text-xs font-medium">Вы видите демо-меню. Подключите базу данных в админке.</p>
          </div>
          <Link href="/admin" className="text-xs font-bold underline text-primary">Перейти</Link>
        </div>
      ) : null}

      {searchQuery ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-1">
            {applyFilters(items).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {categories.map((cat: any) => {
            const catItems = applyFilters(items.filter(i => i.category === cat.id));
            if (catItems.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-4 md:space-y-6">
                <div className="flex items-end justify-between px-4 sm:px-1">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tighter leading-none">
                      {cat.name}
                    </h2>
                    <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-primary/20 rounded-full" />
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground font-bold gap-1 hover:bg-muted/50 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-widest h-auto"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Смотреть все <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                <div className="relative overflow-visible">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar py-4 px-4 sm:px-1 scroll-smooth">
                    {catItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="w-[calc(100vw-64px)] sm:w-[320px] md:w-[340px] flex-shrink-0 snap-center"
                      >
                        <ProductCard item={item} />
                      </div>
                    ))}
                    <div className="min-w-[16px] sm:min-w-[24px] flex-shrink-0" />
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
