
"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ChevronLeft, ShoppingCart, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    toast({
      title: "Заказ оформлен!",
      description: "Мы уже начали готовить ваш вкусный кофе.",
    });
    clearCart();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b px-4 h-16 flex items-center justify-between">
        <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-primary" />
        </Link>
        <h1 className="text-lg font-bold font-headline uppercase tracking-tighter">Ваш заказ</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-headline">Корзина пуста</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                Похоже, вы еще ничего не выбрали. Время побаловать себя чашечкой кофе!
              </p>
            </div>
            <Button asChild className="rounded-2xl px-8 h-12 font-bold shadow-lg">
              <Link href="/">Вернуться в меню</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-[2rem] border p-6 space-y-6 shadow-sm">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 sm:gap-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0">
                      <Image src={item.item.image} alt={item.item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-base sm:text-lg leading-tight">{item.item.name}</h4>
                          <span className="font-bold text-base sm:text-lg">{item.item.price * item.quantity} ₽</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {item.size && `Объем: ${item.size}`}
                          {item.size && item.milk && " • "}
                          {item.milk && `Молоко: ${item.milk === 'regular' ? 'Обычное' : item.milk === 'oat' ? 'Овсяное' : item.milk === 'coconut' ? 'Кокосовое' : 'Миндальное'}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center border rounded-xl bg-muted/30">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none" 
                            onClick={() => updateQuantity(item.cartId, -1)}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none" 
                            onClick={() => updateQuantity(item.cartId, 1)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.cartId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-4 sticky top-24">
              <div className="bg-card rounded-[2rem] border p-6 sm:p-8 space-y-6 shadow-sm">
                <h3 className="font-bold text-xl uppercase tracking-tighter">Итог заказа</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                    <span>Сумма</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                    <span>Доставка</span>
                    <span className="text-primary font-bold">Бесплатно</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-2xl font-black pt-2">
                    <span>Всего</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="w-full rounded-2xl h-14 font-bold text-lg shadow-lg shadow-primary/20 mt-4 gap-3">
                  <CreditCard className="w-5 h-5" />
                  Оплатить {totalPrice} ₽
                </Button>
                <p className="text-[10px] text-center text-muted-foreground px-4 uppercase tracking-widest leading-relaxed">
                  Приятного аппетита и отличного дня!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
