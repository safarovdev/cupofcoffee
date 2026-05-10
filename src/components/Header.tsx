"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col items-center justify-center">
        <Link href="/" className="flex flex-col items-center group transition-all active:scale-95">
          <h1 className="text-2xl md:text-3xl font-black font-headline tracking-[calc(-0.05em)] text-primary uppercase leading-none">
            cupofcoffee
          </h1>
          <div className="w-8 md:w-12 h-1 bg-primary rounded-full mt-1.5 transition-all group-hover:w-full" />
        </Link>
      </div>
    </header>
  );
}