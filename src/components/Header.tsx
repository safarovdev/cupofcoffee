
"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-center">
        <Link href="/" className="flex flex-col items-center group transition-transform active:scale-95">
          {/* Welcome To Line */}
          <div className="flex items-center gap-3 mb-1">
            <div className="h-[2px] w-6 md:w-10 bg-primary/30" />
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-primary uppercase">
              Welcome to
            </span>
            <div className="h-[2px] w-6 md:w-10 bg-primary/30" />
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-primary uppercase leading-none drop-shadow-sm">
            Cup <span className="text-primary/80">Of</span> Coffee
          </h1>
          
          {/* Decorative Glowing Bar */}
          <div className="w-full max-w-[280px] md:max-w-[360px] h-2 bg-primary rounded-full mt-3 shadow-[0_4px_12px_rgba(var(--primary),0.4)] opacity-90" />
        </Link>
      </div>
    </header>
  );
}
