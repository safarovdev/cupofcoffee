
"use client";

import { LayoutDashboard, Users, Settings, ShoppingBag, ClipboardList, Loader2, History } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

export function AdminBottomNav() {
  const pathname = usePathname();
  const firestore = useFirestore();
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
    { href: "/admin/orders", icon: ClipboardList, label: "Заказы", badge: pendingCount, badgeColor: 'bg-orange-500' },
    { href: "/admin/shifts", icon: History, label: "Смены" },
    { href: "/admin/settings", icon: Settings, label: "Товары" },
    { href: "/admin/staff", icon: Users, label: "Штат" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <nav className="max-w-xl mx-auto bg-white/90 backdrop-blur-2xl border border-black/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex justify-around items-center p-2 pointer-events-auto h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isNavigating = navigatingTo === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => !isActive && setNavigatingTo(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 relative h-full flex-1 rounded-[2rem] outline-none",
                isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-black/[0.02]",
                isNavigating && "animate-pulse"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive || isNavigating ? "scale-110" : "scale-100"
              )}>
                {isNavigating ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                )}
              </div>
              <span className={cn(
                "text-[7px] xs:text-[8px] font-black uppercase tracking-[0.1em] transition-all",
                isActive || isNavigating ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn(
                  "absolute top-2 right-1/4 text-white text-[9px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-lg px-1 animate-in zoom-in duration-300",
                  item.badgeColor || "bg-primary"
                )}>
                  {item.badge}
                </span>
              )}
              
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
