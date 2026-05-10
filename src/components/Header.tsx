"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col items-center justify-center">
        <Link href="/" className="flex flex-col items-center group transition-transform active:scale-95">
          {/* Main Title */}
          <h1 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-primary uppercase leading-none">
            cupofcoffee
          </h1>
          
          {/* Decorative Static Bar */}
          <div className="w-full max-w-[140px] md:max-w-[180px] h-1.5 bg-primary rounded-full mt-2" />
        </Link>
      </div>
    </header>
  );
}
