'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminMenuPage() {
  const { totalItems, clearCart } = useCart();
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

    // Перенаправляем на страницу оформления заказа админа
    router.push('/admin/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-muted-foreground hover:text-primary p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-xl uppercase tracking-tight">Меню <span className="text-primary">Admin</span></h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 lg:p-10 pb-40">
        {/* Информационная карточка */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">Режим администратора</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm">
              Вы можете оформлять заказы от имени клиентов. Заказы будут отправлены в систему управления заказами для принятия официантами.
            </p>
          </CardContent>
        </Card>

        {/* Основное меню */}
        <Menu />
      </main>

      {/* Плавающая кнопка Оформить заказ */}
      <div className="fixed bottom-36 right-6 z-[999] lg:bottom-16">
        <Button 
          onClick={handleCheckout}
          size="lg"
          className="rounded-full h-20 px-8 shadow-2xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-3 text-lg"
        >
          <span>Оформить заказ</span>
          <span className="bg-white/30 px-3 py-1 rounded-full text-base font-bold min-w-[28px] text-center">
            {totalItems || 0}
          </span>
        </Button>
      </div>
    </div>
  );
}
