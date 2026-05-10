"use client";

import { Home, ShoppingBasket, Search, History } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Меню" },
    { href: "/track-order", icon: Search, label: "Поиск" },
    { href: "/cart", icon: ShoppingBasket, label: "Корзина", badge: totalItems },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-black/[0.05] px-6 pb-8 pt-3 md:pb-8 md:pt-4 lg:hidden">
      <div className="flex justify-around items-center max-w-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 group transition-all active:scale-90 relative py-1 px-4 rounded-2xl",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300",
                isActive ? "scale-110" : "scale-100"
              )}>
                <Icon className={cn("w-6 h-6 transition-all", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-all",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
              
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-2 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-in zoom-in duration-300">
                  {item.badge}
                </span>
              )}
              
              {isActive && (
                <div className="absolute -top-3 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}