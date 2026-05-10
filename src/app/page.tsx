'use client';

import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { totalItems } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  console.log('Home page - totalItems:', totalItems);

  const handleCheckout = () => {
    console.log('Checkout clicked, totalItems:', totalItems);
    if (totalItems === 0) {
      toast({
        variant: 'destructive',
        title: 'Корзина пуста',
        description: 'Добавьте товары в корзину перед оформлением заказа'
      });
      return;
    }

    // Перенаправляем на страницу оформления заказа
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 lg:p-10 pb-40">
        <Menu />
      </main>

      {/* Плавающая кнопка Оформить заказ */}
      <div className="fixed bottom-24 right-6 z-[999] lg:bottom-8">
        <Button 
          onClick={handleCheckout}
          size="sm"
          className="rounded-full h-12 px-4 shadow-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
        >
          <span className="text-sm">Оформить</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold min-w-[18px] text-center">
            {totalItems || 0}
          </span>
        </Button>
      </div>
    </div>
  );
}
