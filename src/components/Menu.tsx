
"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2, Coffee, AlertCircle, RefreshCw } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from "@/firebase";
import { collection, DocumentData } from 'firebase/firestore';

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
  const firestore = useFirestore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const menuQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'menu');
  }, [firestore]);

  const { data: rawData, loading, error } = useCollection<MenuItem>(menuQuery as any);

  useEffect(() => {
    if (rawData) {
      console.log("AromaFlow Debug: Received menu items count:", rawData.length);
    }
    if (error) {
      console.error("AromaFlow Debug: Firestore Error:", error);
    }
  }, [rawData, error]);

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

  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.category === activeCategory)
    : menuItems;

  if (loading) return (
    <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 animate-pulse">Загрузка меню...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 px-6 space-y-4">
      <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto" />
      <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Ошибка базы данных</p>
      <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mb-4">
        Проверьте консоль браузера для деталей.
      </p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="rounded-full">
        Попробовать снова
      </Button>
    </div>
  );

  if (menuItems.length === 0) return (
    <div className="text-center py-24 px-6 space-y-4">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Coffee className="w-10 h-10 text-primary/20" />
      </div>
      <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Меню скоро обновится</p>
      <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mb-6">Мы наполняем нашу витрину самыми вкусными новинками для вас!</p>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => window.location.reload()} 
        className="rounded-full gap-2 text-[10px] uppercase tracking-widest"
      >
        <RefreshCw className="w-3 h-3" /> Обновить данные
      </Button>
    </div>
  );

  return (
    <div className="space-y-12 md:space-y-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {activeCategory ? (
        <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl border bg-white/50 backdrop-blur-sm h-12 w-12 shrink-0 shadow-sm"
              onClick={() => setActiveCategory(null)}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="space-y-1">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
                {categories.find(c => c.id === activeCategory)?.name || "Категория"}
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {filteredItems.length} позиций доступно
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-16 md:space-y-24">
          {categories.map((cat) => {
            const catItems = menuItems.filter(i => i.category === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-8">
                <div className="flex items-end justify-between border-l-[6px] border-primary pl-5">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black font-headline text-primary uppercase tracking-tighter leading-none">
                      {cat.name}
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Лучшее предложение для вас</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary font-black gap-2 hover:bg-primary/5 px-4 rounded-2xl text-[10px] uppercase tracking-widest h-10 border border-transparent hover:border-primary/10 transition-all"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Смотреть все <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
}
