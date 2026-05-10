'use client';

import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

export default function Home() {
  const { totalItems, totalPrice } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    if (totalItems === 0) {
      toast({
        variant: 'destructive',
        title: 'Корзина пуста',
        description: 'Добавьте товары в корзину перед оформлением заказа'
      });
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 w-full pt-6 sm:pt-10 pb-40">
        {/* Hero Section / Welcome */}
        <div className="max-w-7xl mx-auto px-6 mb-8 sm:mb-12">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">Добро пожаловать в</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tighter leading-none">
              Лучший кофе <br /> в вашем городе
            </h2>
          </div>
        </div>

        <Menu />
      </main>

      {/* Floating Checkout Button - Bottom Right */}
      {totalItems > 0 && (
        <div className="fixed bottom-28 right-6 z-[999] animate-in zoom-in-50 duration-300 lg:bottom-12">
          <Button 
            onClick={handleCheckout}
            size="lg"
            className="h-16 px-6 rounded-2xl shadow-2xl bg-primary hover:bg-primary/95 text-white font-black flex items-center gap-4 transition-transform active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-black">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase tracking-widest opacity-70">Оформить</span>
              <span className="text-sm tracking-tight">{totalPrice} сум</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
