"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col items-center justify-center">
        <Link href="/" className="flex flex-col items-center group transition-transform active:scale-95">
          {/* Welcome To Line */}
          <div className="flex items-center gap-1.5 mb-0">
            <div className="h-[1px] w-3 md:w-5 bg-primary" />
            <span className="text-[6px] md:text-[8px] font-bold tracking-[0.2em] text-primary uppercase">
              Welcome to
            </span>
            <div className="h-[1px] w-3 md:w-5 bg-primary" />
          </div>
          
          {/* Main Title */}
          <h1 className="text-lg md:text-xl font-black font-headline tracking-tighter text-primary uppercase leading-none">
            Cup <span className="text-primary">Of</span> Coffee
          </h1>
          
          {/* Decorative Static Bar */}
          <div className="w-full max-w-[120px] md:max-w-[160px] h-1 bg-primary rounded-full mt-1.5" />
        </Link>
      </div>
    </header>
  );
}
