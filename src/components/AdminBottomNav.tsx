"use client";

import { Home, ShoppingCart, Users, Settings, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function AdminBottomNav() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  
  // Статистика для индикатора заказов
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore');
        
        const config = {
          apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
          authDomain: "coffee-f4bc1.firebaseapp.com",
          projectId: "coffee-f4bc1",
          storageBucket: "coffee-f4bc1.firebasestorage.app",
          messagingSenderId: "847730890494",
          appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
          measurementId: "G-3XN7LXDTJJ"
        };
        
        const app = getApps().length > 0 ? getApp() : initializeApp(config);
        const firestore = getFirestore(app);

        const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        setPendingOrders(pendingCount);
      } catch (error) {
        console.error('Error loading pending orders:', error);
      }
    };

    // Загружаем статистику каждые 30 секунд
    loadPendingOrders();
    const interval = setInterval(loadPendingOrders, 30000);

    return () => clearInterval(interval);
  }, []);

  // Показываем навигацию только на страницах админ панели
  if (!pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-6 pb-4 pt-2 md:pb-6 md:pt-4">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        <Link 
          href="/admin"
          className={cn(
            "flex flex-col items-center gap-1 group transition-all active:scale-90",
            pathname === "/admin" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            pathname === "/admin" ? "bg-primary/5" : "bg-transparent"
          )}>
            <Home className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Главная</span>
        </Link>

        <Link 
          href="/admin/menu"
          className={cn(
            "flex flex-col items-center gap-1 group transition-all active:scale-90",
            pathname === "/admin/menu" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            pathname === "/admin/menu" ? "bg-primary/5" : "bg-transparent"
          )}>
            <ShoppingCart className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Меню</span>
        </Link>

        <Link 
          href="/admin/cart"
          className={cn(
            "flex flex-col items-center gap-1 group transition-all active:scale-90 relative",
            pathname === "/admin/cart" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            pathname === "/admin/cart" ? "bg-primary/5" : "bg-transparent"
          )}>
            <div className="w-5 h-5 sm:w-6 h-6 border-2 border-current rounded-sm" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Корзина</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-background font-black shadow-sm">
              {totalItems}
            </span>
          )}
        </Link>

        <Link 
          href="/admin/orders"
          className={cn(
            "flex flex-col items-center gap-1 group transition-all active:scale-90 relative",
            pathname === "/admin/orders" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            pathname === "/admin/orders" ? "bg-primary/5" : "bg-transparent"
          )}>
            <div className="w-5 h-5 sm:w-6 h-6 border-2 border-current rounded-full" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Заказы</span>
          {pendingOrders > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-background font-black shadow-sm">
              {pendingOrders}
            </span>
          )}
        </Link>

        <Link 
          href="/admin/staff"
          className={cn(
            "flex flex-col items-center gap-1 group transition-all active:scale-90",
            pathname === "/admin/staff" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            pathname === "/admin/staff" ? "bg-primary/5" : "bg-transparent"
          )}>
            <Users className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Персонал</span>
        </Link>

        <Link 
          href="/admin/settings"
          className={cn(
            "flex flex-col items-center gap-1 group transition-all active:scale-90",
            pathname === "/admin/settings" ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            pathname === "/admin/settings" ? "bg-primary/5" : "bg-transparent"
          )}>
            <Settings className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Настройки</span>
        </Link>
      </div>
    </nav>
  );
}
