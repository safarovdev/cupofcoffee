
"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
        <Link href="/">
          <h1 className="text-xl font-bold font-headline tracking-tight text-primary">
            Cup Of Coffee
          </h1>
        </Link>
      </div>
    </header>
  );
}
