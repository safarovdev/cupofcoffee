
"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center justify-center">
        <Link href="/" className="flex flex-col items-center group transition-transform active:scale-95">
          {/* Welcome To Line */}
          <div className="flex items-center gap-2 mb-0.5">
            <div className="h-[1.5px] w-4 md:w-6 bg-primary" />
            <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              Welcome to
            </span>
            <div className="h-[1.5px] w-4 md:w-6 bg-primary" />
          </div>
          
          {/* Main Title */}
          <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tighter text-primary uppercase leading-none">
            Cup <span className="text-primary">Of</span> Coffee
          </h1>
          
          {/* Decorative Static Bar */}
          <div className="w-full max-w-[180px] md:max-w-[240px] h-1.5 bg-primary rounded-full mt-2" />
        </Link>
      </div>
    </header>
  );
}
