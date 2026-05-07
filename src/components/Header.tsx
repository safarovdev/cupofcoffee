"use client";

import { Leaf, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-tight text-primary">AromaFlow</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none">Artisan Roastery</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden md:flex gap-2 border-primary/20 hover:bg-primary/5">
            <span>Our Philosophy</span>
          </Button>
          <Button variant="default" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Order Now</span>
          </Button>
        </div>
      </div>
    </header>
  );
}