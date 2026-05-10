"use client";

import { Home, ShoppingBasket } from "lucide-react";
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
    { href: "/cart", icon: ShoppingBasket, label: "Корзина", badge: totalItems },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-2xl border-t border-black/[0.03] px-6 pb-6 pt-3 md:pb-8 md:pt-4">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 group transition-all active:scale-90 relative py-1 px-4 rounded-2xl",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1 transition-all duration-300",
                isActive ? "scale-110" : "scale-100"
              )}>
                <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 right-2 bg-primary text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm px-1">
                  {item.badge}
                </span>
              )}
              
              {isActive && (
                <div className="absolute -top-3 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
