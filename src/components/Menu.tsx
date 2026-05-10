"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2, Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
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
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
        
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
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.name.localeCompare(b.name);
          });
        
        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const items = useMemo(() => menuItems, [menuItems]);

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
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <Loader2 className="w-12 h-12 animate-spin text-primary absolute top-0 left-0 [animation-delay:-0.3s]" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/40 animate-pulse">Загрузка меню...</p>
    </div>
  );

  if (items.length === 0) return (
    <div className="text-center py-20 px-6 space-y-4 bg-white rounded-[3rem] border border-black/5 mx-4">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
        <Search className="w-8 h-8 text-muted-foreground/30" />
      </div>
      <h3 className="text-xl font-bold">Меню пока пусто</h3>
      <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">Мы обновляем ассортимент, загляните чуть позже!</p>
    </div>
  );

  if (activeCategory && !searchQuery) {
    const categoryName = categories.find((c: any) => c.id === activeCategory)?.name || "";
    const filteredItems = items.filter(i => i.category === activeCategory);

    return (
      <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl bg-white shadow-sm border border-black/5 hover:bg-muted"
            onClick={() => setActiveCategory(null)}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black font-headline text-primary uppercase tracking-tighter">
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
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Найдено {applyFilters(items).length} позиций</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {applyFilters(items).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12 md:space-y-20">
          {categories.map((cat: any) => {
            const catItems = items.filter(i => i.category === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-6 md:space-y-8">
                <div className="flex items-end justify-between px-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-4xl font-black font-headline text-primary uppercase tracking-tighter">
                      {cat.name}
                    </h2>
                    <div className="h-1 w-12 bg-primary/20 rounded-full" />
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary font-black gap-2 hover:bg-primary/5 px-4 py-2 rounded-2xl text-[10px] uppercase tracking-widest h-auto border border-primary/10"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Смотреть все <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x-mandatory no-scrollbar py-4 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:snap-none">
                    {catItems.slice(0, 8).map((item) => (
                      <div 
                        key={item.id} 
                        className="w-[85vw] sm:w-[320px] md:w-full flex-shrink-0 snap-center"
                      >
                        <ProductCard item={item} />
                      </div>
                    ))}
                    <div className="min-w-[20px] md:hidden" />
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