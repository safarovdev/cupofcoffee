
"use client";

import { Home, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  // Не показываем панель на страницах админки
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Меню" },
    { href: "/cart", icon: ShoppingBasket, label: "Корзина", badge: totalItems },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] px-6 pb-6 pt-2 pointer-events-none">
      <nav className="max-w-xs mx-auto bg-white/90 backdrop-blur-2xl border border-black/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-[2rem] flex justify-around items-center p-1.5 pointer-events-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative h-full flex-1 rounded-[1.5rem]",
                isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-black/[0.01]"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-105" : "scale-100"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className={cn(
                "text-[7px] font-black uppercase text-center tracking-[0.2em] transition-all",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-[25%] bg-primary text-white text-[8px] min-w-[15px] h-[15px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-md px-1 animate-in zoom-in duration-300">
                  {item.badge}
                </span>
              )}
              
              {isActive && (
                <div className="absolute -bottom-0.5 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
