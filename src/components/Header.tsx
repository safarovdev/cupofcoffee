"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-xl border-b border-black/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex flex-col items-center group">
          <h1 className="text-xl font-black font-headline tracking-[-0.04em] text-primary uppercase leading-none">
            AromaFlow
          </h1>
          <span className="text-[8px] font-bold text-primary/20 uppercase tracking-[0.5em] mt-1 group-hover:text-primary/60 transition-colors">
            Coffee Studio
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-primary/20" />
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <div className="w-1 h-1 rounded-full bg-primary/60" />
        </div>
      </div>
    </header>
  );
}
