
'use client';

import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white">
      <Header />
      
      <main className="flex-1 w-full pt-8 sm:pt-14 pb-40">
        <div className="max-w-7xl mx-auto px-6 mb-12 sm:mb-20 text-center md:text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-[2px] bg-primary/20 hidden md:block" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Идеальный момент для кофе</p>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black font-headline tracking-tighter leading-[0.9] text-primary">
              Пробуждай <br /> свои чувства
            </h2>
          </div>
        </div>

        <Menu />
      </main>
    </div>
  );
}
