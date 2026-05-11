"use client";

import { useState, useMemo } from "react";
import { Loader2, AlertCircle, Sparkles, Flame } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from 'firebase/firestore';
import { cn } from "@/lib/utils";
import Image from "next/image";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  category: string;
  isSpecial?: boolean;
  imageUrl?: string;
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
    const special = items.find(i => i.isSpecial) || null;

    const hoursSlot = Math.floor(new Date().getHours() / 4);
    const dayKey = new Date().toISOString().split('T')[0];
    const seed = `${dayKey}-${hoursSlot}`;
    
    const shuffled = [...items]
      .filter(i => !special || i.id !== special.id)
      .sort((a, b) => {
        const hashA = (a.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = (b.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hashA % 10) - (hashB % 10);
      })
      .slice(0, 4);

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
      specialOffer: special, 
      recommendedItems: shuffled 
    };
  }, [rawData]);

  const filteredItems = useMemo(() => {
    if (!activeCategory) return menuItems;
    return menuItems.filter(item => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  if (loading && !rawData) return (
    <div className="h-[30vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary/10" />
      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/20 animate-pulse">Загрузка...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-16 px-4 space-y-4">
      <AlertCircle className="w-10 h-10 text-destructive/20 mx-auto" />
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Ошибка сети</p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="rounded-full h-9 px-5 font-bold">
        Обновить
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="sticky top-[52px] sm:top-[60px] z-40 bg-background/80 backdrop-blur-md py-3 border-b border-black/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "whitespace-nowrap h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                activeCategory === null 
                  ? "bg-primary text-white shadow-md" 
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
                  "whitespace-nowrap h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  activeCategory === cat.id 
                    ? "bg-primary text-white shadow-md" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {!activeCategory && (
          <>
            {specialOffer && (
              <section className="animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <h2 className="text-lg font-black uppercase tracking-tighter">Спецпредложение</h2>
                </div>
                <div className="bg-primary rounded-[2rem] p-6 sm:p-10 text-white relative overflow-hidden group shadow-xl">
                  {specialOffer.imageUrl && (
                    <div className="absolute inset-0 opacity-30">
                      <Image 
                        src={specialOffer.imageUrl} 
                        alt="Background" 
                        fill 
                        className="object-cover blur-md"
                      />
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center">
                    {specialOffer.imageUrl && (
                      <div className="w-24 h-24 sm:w-40 sm:h-40 relative rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 shrink-0">
                        <Image 
                          src={specialOffer.imageUrl} 
                          alt={specialOffer.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest">Хит месяца</span>
                      <h3 className="text-2xl sm:text-4xl font-black font-headline tracking-tighter leading-none">{specialOffer.name}</h3>
                      <p className="text-white/60 text-xs max-w-md line-clamp-2">{specialOffer.description}</p>
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <span className="text-xl sm:text-2xl font-black tracking-tighter">{specialOffer.price.toLocaleString()} сум</span>
                        <ProductCard item={specialOffer} isMinimal />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {recommendedItems.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary fill-primary/20" />
                  <h2 className="text-lg font-black uppercase tracking-tighter">Рекомендуем вам</h2>
                </div>
                <div className="relative">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6">
                    {recommendedItems.map((item) => (
                      <div key={item.id} className="min-w-[240px] sm:min-w-[280px] snap-center">
                        <ProductCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        <div className="space-y-10 sm:space-y-16">
          {activeCategory ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                <section key={cat.id} id={`category-${cat.id}`} className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black font-headline text-primary uppercase tracking-tighter">
                      {cat.name}
                    </h2>
                    <Button 
                      variant="ghost" 
                      className="text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors h-7 px-2"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      Все
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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