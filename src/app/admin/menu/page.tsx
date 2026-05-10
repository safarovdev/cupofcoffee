'use client';

import { useState, useEffect } from 'react';
import { Menu } from "@/components/Menu";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShieldAlert, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminMenuPage() {
  const { totalItems } = useCart();
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
    router.push('/admin/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-muted-foreground hover:text-primary p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h1 className="font-black text-lg uppercase tracking-tight">Меню <span className="text-primary">Admin</span></h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-40">
        <Card className="mb-6 bg-blue-50/50 border-blue-100 rounded-[2rem]">
          <CardContent className="pt-6">
            <p className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">Режим администратора</p>
            <p className="text-blue-600/80 text-sm">Оформление заказа от имени клиента.</p>
          </CardContent>
        </Card>

        <Menu />
      </main>

      {/* Компактная плавающая кнопка заказа */}
      {totalItems > 0 && (
        <div className="fixed bottom-28 right-6 z-[999] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button 
            onClick={handleCheckout}
            size="lg"
            className="rounded-full h-14 px-6 shadow-2xl bg-primary hover:bg-primary/90 text-white font-black flex items-center gap-3 transition-transform active:scale-95 border-2 border-white/10"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.2em]">Заказ</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">
              {totalItems}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
