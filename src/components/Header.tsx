
"use client";

import Link from "next/link";
import { Menu as MenuIcon, X, Coffee, Wine, IceCream, Beaker, Cookie, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Header() {
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const menuQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'menu');
  }, [db]);

  const { data: menuItems } = useCollection<any>(menuQuery as any);

  const categories = useMemo(() => {
    if (!menuItems) return [];
    const unique = new Map();
    const categoryOrder = ['coffee', 'tea', 'mojito', 'mojito-carafe', 'milkshakes', 'ice-cream', 'desserts', 'bakery'];
    const categoryNames: Record<string, string> = {
      'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
      'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
      'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
    };

    menuItems.forEach((item: any) => {
      if (item.category && !unique.has(item.category)) {
        unique.set(item.category, categoryNames[item.category] || item.category);
      }
    });

    return Array.from(unique.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.id);
        const bIndex = categoryOrder.indexOf(b.id);
        return (aIndex !== -1 ? aIndex : 99) - (bIndex !== -1 ? bIndex : 99);
      });
  }, [menuItems]);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'coffee': return <Coffee className="w-4 h-4" />;
      case 'tea': return <Coffee className="w-4 h-4 rotate-12" />;
      case 'mojito': return <Wine className="w-4 h-4" />;
      case 'mojito-carafe': return <Beaker className="w-4 h-4" />;
      case 'milkshakes': return <Wine className="w-4 h-4" />;
      case 'ice-cream': return <IceCream className="w-4 h-4" />;
      default: return <Cookie className="w-4 h-4" />;
    }
  };

  const scrollToCategory = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-xl border-b border-black/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary">
                <MenuIcon className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-none rounded-r-[2.5rem]">
              <SheetHeader className="p-8 bg-primary text-white">
                <SheetTitle className="text-white text-2xl font-black uppercase tracking-tighter">
                  Каталог
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] p-6">
                <div className="space-y-2">
                  <button
                    onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <span className="font-black uppercase text-[10px] tracking-widest">Главная</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary/20" />
                  </button>

                  <div className="py-4 px-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/30 mb-4">Категории меню</p>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => scrollToCategory(cat.id)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              {getCategoryIcon(cat.id)}
                            </div>
                            <span className="font-black uppercase text-[10px] tracking-widest">{cat.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-primary/20" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex flex-col items-center group">
            <h1 className="text-xl font-black font-headline tracking-[-0.04em] text-primary uppercase leading-none">
              AromaFlow
            </h1>
            <span className="text-[8px] font-bold text-primary/20 uppercase tracking-[0.5em] mt-1 group-hover:text-primary/60 transition-colors">
              Coffee Studio
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-primary/20" />
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <div className="w-1 h-1 rounded-full bg-primary/60" />
        </div>
      </div>
    </header>
  );
}
