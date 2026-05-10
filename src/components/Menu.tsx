"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2, Coffee, AlertCircle, RefreshCw } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from 'firebase/firestore';
import { cn } from "@/lib/utils";

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
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const menuQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'menu');
  }, [db]);

  const { data: rawData, loading, error } = useCollection<MenuItem>(menuQuery as any);

  const { menuItems, categories } = useMemo(() => {
    if (!rawData || rawData.length === 0) return { menuItems: [], categories: [] };

    const items = rawData as MenuItem[];
    const uniqueCategories = new Map();
    
    items.forEach((item) => {
      if (item.category && !uniqueCategories.has(item.category)) {
        uniqueCategories.set(item.category, item.category);
      }
    });

    const categoryOrder = ['coffee', 'tea', 'mojito', 'mojito-carafe', 'milkshakes', 'ice-cream', 'desserts', 'bakery'];
    const categoryNames: Record<string, string> = {
      'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
      'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
      'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
    };

    const categoriesArray = Array.from(uniqueCategories.keys())
      .map(catId => ({
        id: catId,
        name: categoryNames[catId] || catId
      }))
      .sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.id);
        const bIndex = categoryOrder.indexOf(b.id);
        return (aIndex !== -1 ? aIndex : 99) - (bIndex !== -1 ? bIndex : 99);
      });

    return { menuItems: items, categories: categoriesArray };
  }, [rawData]);

  const filteredItems = useMemo(() => {
    if (!activeCategory) return menuItems;
    return menuItems.filter(item => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  if (loading && !rawData) return (
    <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-10 h-10 animate-spin text-primary/10" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/20 animate-pulse">Загрузка...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 px-6 space-y-4">
      <AlertCircle className="w-12 h-12 text-destructive/20 mx-auto" />
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Ошибка сети</p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="rounded-full h-10 px-6 font-bold">
        Обновить
      </Button>
    </div>
  );

  if (menuItems.length === 0) return (
    <div className="text-center py-24 px-6 space-y-6">
      <div className="w-20 h-20 bg-muted/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-black/[0.03]">
        <Coffee className="w-10 h-10 text-primary/5" />
      </div>
      <p className="text-primary/40 font-black uppercase tracking-widest text-[10px]">Меню скоро появится</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Современный селектор категорий */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "whitespace-nowrap h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              activeCategory === null 
                ? "bg-primary text-white shadow-lg scale-105" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            Все меню
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "whitespace-nowrap h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                activeCategory === cat.id 
                  ? "bg-primary text-white shadow-lg scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-12">
        {activeCategory ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : (
          <div className="space-y-16">
            {categories.map((cat) => {
              const catItems = menuItems.filter(i => i.category === cat.id);
              if (catItems.length === 0) return null;

              return (
                <section key={cat.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black font-headline text-primary uppercase tracking-tighter">
                      {cat.name}
                    </h2>
                    <Button 
                      variant="ghost" 
                      className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      Смотреть все
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {catItems.slice(0, 4).map((item) => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
