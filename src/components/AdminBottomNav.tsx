
"use client";

import { LayoutDashboard, Users, Settings, ClipboardList, Loader2, BarChart3, ShoppingCart } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";

export function AdminBottomNav() {
  const pathname = usePathname();
  const firestore = useFirestore();
  const { totalItems } = useCart();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const pendingOrdersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), where('status', '==', 'pending'));
  }, [firestore]);

  const { data: pendingOrders } = useCollection(pendingOrdersQuery);
  const pendingCount = pendingOrders?.length || 0;

  if (!pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Панель" },
    { href: "/admin/menu", icon: Users, label: "Меню" },
    { href: "/admin/cart", icon: ShoppingCart, label: "Чек", badge: totalItems, badgeColor: 'bg-primary' },
    { href: "/admin/orders", icon: ClipboardList, label: "Заказы", badge: pendingCount, badgeColor: 'bg-orange-500' },
    { href: "/admin/shifts", icon: BarChart3, label: "Финансы" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] px-4 pb-6 pt-2 pointer-events-none">
      <nav className="max-w-md mx-auto bg-white/95 backdrop-blur-2xl border border-black/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-[2rem] flex justify-around items-center p-1 pointer-events-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isNavigating = navigatingTo === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => {
                if (!isActive) setNavigatingTo(item.href);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative h-full flex-1 rounded-[1.5rem] outline-none",
                isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-black/[0.01]",
                isNavigating && "animate-pulse"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive || isNavigating ? "scale-105" : "scale-100"
              )}>
                {isNavigating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                )}
              </div>
              <span className={cn(
                "text-[7px] font-black uppercase text-center tracking-[0.1em] transition-all",
                isActive || isNavigating ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              
              {item.badge !== undefined && item.badge > 0 && !isNavigating && (
                <span className={cn(
                  "absolute top-1.5 right-1/4 text-white text-[7px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full font-black border border-white shadow-sm px-1 animate-in zoom-in duration-300",
                  item.badgeColor || "bg-primary"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
