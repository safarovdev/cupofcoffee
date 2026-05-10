"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-xl border-b border-black/[0.03]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
        <Link href="/" className="flex flex-col items-center group transition-all active:scale-95">
          <h1 className="text-xl md:text-2xl font-black font-headline tracking-[calc(-0.03em)] text-primary uppercase leading-none">
            cupofcoffee
          </h1>
          <div className="w-6 h-0.5 bg-primary rounded-full mt-1 opacity-20 transition-all group-hover:opacity-100 group-hover:w-full" />
        </Link>
      </div>
    </header>
  );
}
