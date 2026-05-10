'use client';

import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 w-full pt-6 sm:pt-10 pb-40">
        <div className="max-w-7xl mx-auto px-6 mb-8 sm:mb-12 text-center lg:text-left">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">Добро пожаловать в</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tighter leading-none">
              Лучший кофе <br /> в вашем городе
            </h2>
          </div>
        </div>

        <Menu />
      </main>
    </div>
  );
}
