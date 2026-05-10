
"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2, Coffee, AlertCircle, Sparkles, Flame, ChevronRight } from "lucide-react";
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
  isSpecial?: boolean;
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

  const { menuItems, categories, specialOffer, recommendedItems } = useMemo(() => {
    if (!rawData || rawData.length === 0) return { menuItems: [], categories: [], specialOffer: null, recommendedItems: [] };

    const items = rawData as MenuItem[];
    
    // 1. Поиск специального предложения
    const special = items.find(i => i.isSpecial) || items[0];

    // 2. Логика "Рекомендуем вам" (перемешивание каждые 4 часа)
    const hoursSlot = Math.floor(new Date().getHours() / 4);
    const dayKey = new Date().toISOString().split('T')[0];
    const seed = `${dayKey}-${hoursSlot}`;
    
    const shuffled = [...items]
      .filter(i => i.id !== special.id)
      .sort((a, b) => {
        const hashA = (a.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = (b.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hashA % 10) - (hashB % 10);
      })
      .slice(0, 4);

    // 3. Категории
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

    return { 
      menuItems: items, 
      categories: categoriesArray, 
      specialOffer: items.find(i => i.isSpecial) || null, 
      recommendedItems: shuffled 
    };
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

  return (
    <div className="w-full">
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-black/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "whitespace-nowrap h-10 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                activeCategory === null 
                  ? "bg-primary text-white shadow-lg" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Главная
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "whitespace-nowrap h-10 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  activeCategory === cat.id 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {!activeCategory && (
          <>
            {/* Специальное предложение */}
            {specialOffer && (
              <section className="animate-in fade-in zoom-in duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Спецпредложение</h2>
                </div>
                <div className="bg-primary rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">Хит месяца</span>
                      <h3 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter leading-none">{specialOffer.name}</h3>
                      <p className="text-white/60 text-sm max-w-md line-clamp-2">{specialOffer.description}</p>
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <span className="text-3xl font-black tracking-tighter">{specialOffer.price.toLocaleString()} сум</span>
                        <ProductCard item={specialOffer} isMinimal />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Рекомендации - Горизонтальный скролл */}
            {recommendedItems.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary fill-primary/20" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Рекомендуем вам</h2>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory -mx-6 px-6">
                    {recommendedItems.map((item) => (
                      <div key={item.id} className="min-w-[280px] sm:min-w-[320px] snap-center">
                        <ProductCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        <div className="space-y-16">
          {activeCategory ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : (
            categories.map((cat) => {
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
                      className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors h-8"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      Смотреть все
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catItems.slice(0, 4).map((item) => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
