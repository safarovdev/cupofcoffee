"use client";

import { Home, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] text-white border-t border-white/10 px-6 pb-6 pt-3 md:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-1 group transition-colors text-white"
          >
            <div className="p-1">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">Главная</span>
          </button>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 group transition-colors relative text-[#888888] hover:text-white"
          >
            <div className="p-1">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">Корзина</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1A1A1A] font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
