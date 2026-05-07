"use client";

import { Home, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-6 pb-4 pt-2 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link 
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 group transition-colors",
            pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className="p-1">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Главная</span>
        </Link>

        <Link 
          href="/cart"
          className={cn(
            "flex flex-col items-center gap-1 group transition-colors relative",
            pathname === "/cart" ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className="p-1">
            <ShoppingBasket className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Корзина</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-background font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
