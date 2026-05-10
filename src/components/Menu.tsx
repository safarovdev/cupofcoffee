"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2, Coffee } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFirestore } from "@/firebase";
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

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
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'menu'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as MenuItem[];
      
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
          return (aIndex !== -1 ? aIndex : 99) - (bIndex !== -1 ? bIndex : 99);
        });
      
      setCategories(categoriesArray);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Subscription Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.ingredients?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !activeCategory || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Загрузка меню...</p>
    </div>
  );

  if (menuItems.length === 0) return (
    <div className="text-center py-20 px-6 space-y-4">
      <Coffee className="w-12 h-12 text-primary/10 mx-auto" />
      <p className="text-muted-foreground text-sm uppercase tracking-widest">Меню скоро обновится</p>
    </div>
  );

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto px-6">
      {searchQuery || activeCategory ? (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl border h-10 w-10 shrink-0"
              onClick={() => setActiveCategory(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                {activeCategory ? (categories.find(c => c.id === activeCategory)?.name) : "Результаты"}
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Найдено {filteredItems.length} позиций
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12 md:space-y-20">
          {categories.map((cat) => {
            const catItems = menuItems.filter(i => i.category === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-6">
                <div className="flex items-end justify-between border-l-4 border-primary pl-4">
                  <div className="space-y-0.5">
                    <h2 className="text-2xl font-black font-headline text-primary uppercase tracking-tighter leading-none">
                      {cat.name}
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Популярное в категории</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary font-black gap-1 hover:bg-primary/5 px-2 rounded-xl text-[10px] uppercase tracking-widest h-auto"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Все <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
