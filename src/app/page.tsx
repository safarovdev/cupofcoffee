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
      
      <main className="flex-1 w-full pt-8 sm:pt-12 pb-40">
        {/* Hero Section / Welcome */}
        <div className="max-w-7xl mx-auto px-6 mb-12 sm:mb-16">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Добро пожаловать в</p>
            <h2 className="text-4xl sm:text-6xl font-black font-headline tracking-tighter leading-[0.9]">
              Лучший кофе <br /> в вашем городе
            </h2>
          </div>
        </div>

        <Menu />
      </main>

      {/* Floating Checkout Bar - Native Mobile Look */}
      {totalItems > 0 && (
        <div className="fixed bottom-24 left-0 right-0 z-[999] px-6 animate-in slide-in-from-bottom-8 duration-500 lg:bottom-12 lg:max-w-md lg:ml-auto">
          <Button 
            onClick={handleCheckout}
            size="lg"
            className="w-full h-16 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-primary hover:bg-primary/95 text-white font-black flex items-center justify-between px-8 transition-transform active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-black">
                  {totalItems}
                </span>
              </div>
              <span className="text-sm uppercase tracking-widest">Оформить</span>
            </div>
            <div className="h-6 w-px bg-white/20 mx-4" />
            <span className="text-lg tracking-tighter">{totalPrice} сум</span>
          </Button>
        </div>
      )}
    </div>
  );
}