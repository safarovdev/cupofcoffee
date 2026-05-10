
"use client";

import { Home, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  // Скрываем навигацию на страницах администрирования
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-4 pb-4 pt-3 md:pb-6 md:pt-4">
      <div className="flex justify-around items-center max-w-xl mx-auto">
        <Link 
          href="/"
          className={cn(
            "flex flex-col items-center gap-1.5 group transition-all active:scale-90 min-w-[60px]",
            pathname === "/" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            pathname === "/" ? "bg-primary/10" : "bg-transparent"
          )}>
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.1em]">Главная</span>
        </Link>

        <Link 
          href="/cart"
          className={cn(
            "flex flex-col items-center gap-1.5 group transition-all relative active:scale-90 min-w-[60px]",
            pathname === "/cart" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            pathname === "/cart" ? "bg-primary/10" : "bg-transparent"
          )}>
            <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.1em]">Корзина</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-background font-black shadow-md">
              {totalItems}
            </span>
          )}
        </Link>

      </div>
    </nav>
  );
}
