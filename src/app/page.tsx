'use client';

import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full pt-4 sm:pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-10">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-primary/20" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">Premium Coffee Experience</p>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tighter leading-[0.95] text-primary break-words">
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