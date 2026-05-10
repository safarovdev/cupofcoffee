"use client";

import { LayoutDashboard, ShoppingCart, Users, Settings, ShoppingBag, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function AdminBottomNav() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        const { firebaseConfig } = await import('@/firebase/config');
        
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);

        const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
        const pendingCount = ordersSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
        setPendingOrders(pendingCount);
      } catch (error) {
        console.error('Error loading pending orders:', error);
      }
    };

    loadPendingOrders();
    const interval = setInterval(loadPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Панель" },
    { href: "/admin/menu", icon: ShoppingBag, label: "Меню" },
    { href: "/admin/orders", icon: ClipboardList, label: "Заказы", badge: pendingOrders, badgeColor: 'bg-orange-500' },
    { href: "/admin/staff", icon: Users, label: "Штат" },
    { href: "/admin/settings", icon: Settings, label: "Товары" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <nav className="max-w-xl mx-auto bg-black text-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] flex justify-around items-center p-2 pointer-events-auto h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 relative h-full flex-1 rounded-[2rem]",
                isActive ? "text-white bg-white/10" : "text-white/40 hover:bg-white/5"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-110" : "scale-100"
              )}>
                <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.15em] transition-all",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn(
                  "absolute top-2 right-1/4 text-white text-[9px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-black shadow-lg px-1",
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
