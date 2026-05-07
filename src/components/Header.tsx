"use client";

import { ShoppingBag, Search, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export function Header() {
  const { totalItems, searchQuery, setSearchQuery } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden rounded-full">
            <MenuIcon className="w-6 h-6" />
          </Button>
          <Link href="/">
            <h1 className="text-xl font-bold font-headline tracking-tight text-primary">Cup Of Coffee</h1>
          </Link>
        </div>

        <div className="flex-1 max-w-md hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Поиск по меню" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="md:hidden rounded-full bg-secondary/80 hover:bg-secondary">
            <Search className="w-5 h-5" />
          </Button>
          
          <Link href="/cart">
            <Button 
              variant="default" 
              className="hidden md:flex gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-full px-5 h-10 font-bold relative"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Заказ</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
