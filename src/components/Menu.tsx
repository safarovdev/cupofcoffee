
"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2, Search, Coffee } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFirestore } from "@/firebase";
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';

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
  const { firestore } = useFirestore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    // Используем onSnapshot для мгновенного обновления и надежной загрузки
    const q = query(collection(firestore, 'menu'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
      setMenuItems(items);
      
      const uniqueCategories = new Map();
      items.forEach((item: MenuItem) => {
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
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          return 0;
        });
      
      setCategories(categoriesArray);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const applyFilters = (itemList: MenuItem[]) => {
    return itemList.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || 
               item.ingredients?.some(i => i.toLowerCase().includes(q));
      }
      return true;
    });
  };

  if (loading) return (
    <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
        <Loader2 className="w-16 h-16 animate-spin text-primary absolute top-0 left-0 [animation-delay:-0.3s]" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">Загрузка AromaFlow...</p>
    </div>
  );

  if (menuItems.length === 0) return (
    <div className="text-center py-20 px-6 space-y-6">
      <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto">
        <Coffee className="w-10 h-10 text-primary/20" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black uppercase tracking-tighter">Меню скоро обновится</h3>
        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">Мы готовим для вас нечто особенное. Пожалуйста, загляните позже!</p>
      </div>
    </div>
  );

  if (activeCategory && !searchQuery) {
    const categoryName = categories.find((c: any) => c.id === activeCategory)?.name || "";
    const filteredItems = menuItems.filter(i => i.category === activeCategory);

    return (
      <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl bg-white shadow-sm border border-black/5 h-12 w-12"
            onClick={() => setActiveCategory(null)}
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {categoryName}
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredItems.length} позиций</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-20 pb-20 max-w-7xl mx-auto">
      {searchQuery ? (
        <section className="space-y-8 px-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Результаты поиска</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Найдено {applyFilters(menuItems).length} позиций</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {applyFilters(menuItems).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12 md:space-y-20">
          {categories.map((cat: any) => {
            const catItems = menuItems.filter(i => i.category === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-8">
                <div className="flex items-end justify-between px-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black font-headline text-primary uppercase tracking-tighter">
                      {cat.name}
                    </h2>
                    <div className="h-1.5 w-12 bg-primary rounded-full" />
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary font-black gap-2 hover:bg-primary/5 px-6 py-2 rounded-2xl text-[10px] uppercase tracking-widest h-auto border border-primary/10"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Все {cat.name} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="flex gap-6 overflow-x-auto snap-x-mandatory no-scrollbar py-4 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:snap-none">
                    {catItems.slice(0, 8).map((item) => (
                      <div 
                        key={item.id} 
                        className="w-[85vw] sm:w-[320px] md:w-full flex-shrink-0 snap-center"
                      >
                        <ProductCard item={item} />
                      </div>
                    ))}
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
