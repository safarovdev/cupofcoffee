'use client';

import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full pt-6 sm:pt-10 pb-40">
        <div className="max-w-7xl mx-auto px-6 mb-8 sm:mb-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-primary/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Premium Coffee Experience</p>
            </div>
            <h2 className="text-4xl sm:text-7xl lg:text-8xl font-black font-headline tracking-tighter leading-[0.9] text-primary break-words">
              Аромат <br /> 
              <span className="text-primary/20">вашего</span> дня
            </h2>
          </div>
        </div>

        <Menu />
      </main>
    </div>
  );
}