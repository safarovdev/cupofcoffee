"use client";

import { Coffee, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-primary">Cup Of Coffee</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none hidden sm:block">Ремесленная обжарка</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" className="hidden md:flex font-bold text-sm">
            О нас
          </Button>
          <Button variant="default" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-4 sm:px-6">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm">Заказать</span>
          </Button>
        </div>
      </div>
    </header>
  );
}