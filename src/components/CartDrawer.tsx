"use client";

import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
      title: "Заказ оформлен!",
      description: "Мы уже начали готовить ваш вкусный кофе.",
    });
    clearCart();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Ваш заказ
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-headline">Корзина пуста</h3>
            <p className="text-muted-foreground text-sm">Похоже, вы еще ничего не выбрали. Время побаловать себя!</p>
            <Button onClick={onClose} variant="outline" className="rounded-full">Перейти в меню</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <Image src={item.item.image} alt={item.item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm leading-tight">{item.item.name}</h4>
                        <span className="font-bold text-sm">{item.item.price * item.quantity} ₽</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.size && `Объем: ${item.size}`}
                        {item.size && item.milk && " • "}
                        {item.milk && `Молоко: ${item.milk === 'regular' ? 'Обычное' : item.milk === 'oat' ? 'Овсяное' : item.milk === 'coconut' ? 'Кокосовое' : 'Миндальное'}`}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border rounded-lg bg-muted/30">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none" 
                            onClick={() => updateQuantity(item.cartId, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none" 
                            onClick={() => updateQuantity(item.cartId, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                          onClick={() => removeFromCart(item.cartId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 border-t flex-col gap-4">
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Сумма заказа</span>
                  <span>{totalPrice} ₽</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Доставка</span>
                  <span className="text-primary font-bold">Бесплатно</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span>{totalPrice} ₽</span>
                </div>
              </div>
              <Button onClick={handleCheckout} className="w-full rounded-2xl h-14 font-bold text-lg shadow-lg">
                Оформить заказ
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
