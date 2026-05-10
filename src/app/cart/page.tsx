
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Minus, ChevronLeft, ShoppingCart, Coffee, Wine, IceCream, Beaker, Cookie, ArrowRight, Loader2, User } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

function SmallPlaceholder({ category }: { category: string }) {
  const getIcon = () => {
    switch (category) {
      case 'coffee': return <Coffee className="w-6 h-6" />;
      case 'ice-coffee': return <Coffee className="w-6 h-6" />;
      case 'mojito': return <Wine className="w-6 h-6" />;
      case 'mojito-carafe': return <Beaker className="w-6 h-6" />;
      case 'tea': return <Coffee className="w-6 h-6 rotate-12" />;
      case 'ice-tea': return <Wine className="w-6 h-6" />;
      case 'milkshakes': return <Wine className="w-6 h-6" />;
      case 'ice-cream': return <IceCream className="w-6 h-6" />;
      default: return <Cookie className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full h-full bg-accent/20 flex items-center justify-center text-primary/30">
      {getIcon()}
    </div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Введите имя',
        description: 'Пожалуйста, укажите ваше имя для оформления заказа'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, doc, setDoc, getDocs, serverTimestamp } = await import('firebase/firestore');
      const { firebaseConfig } = await import('@/firebase/config');
      
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);

      const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
      const orderId = String(ordersSnapshot.size + 1).padStart(4, '0');

      const orderData = {
        customerName: customerName.trim(),
        customerPhone: '',
        customerNotes: '',
        items: cart.map(cartItem => ({
          id: cartItem.item.id,
          name: cartItem.item.name,
          price: cartItem.priceAtSelection,
          quantity: cartItem.quantity,
          category: cartItem.item.category,
          selectedSize: cartItem.size || '',
          sizePrice: cartItem.size ? cartItem.priceAtSelection : null
        })),
        totalAmount: totalPrice,
        totalItems: totalItems,
        status: 'pending',
        createdAt: serverTimestamp(),
        acceptedBy: null,
        acceptedAt: null,
        createdBy: 'customer'
      };

      await setDoc(doc(firestore, 'orders', orderId), orderData);

      clearCart();
      toast({
        title: 'Заказ успешно оформлен!',
        description: `Ваш заказ #${orderId} принят кофейней.`,
      });

      router.push('/');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось оформить заказ. Попробуйте позже.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b px-6 h-16 flex items-center justify-between">
        <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-primary" />
        </Link>
        <h1 className="text-lg font-black font-headline uppercase tracking-tighter">Ваш заказ</h1>
        <div className="w-10" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black font-headline uppercase tracking-tighter">Корзина пуста</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">
                Похоже, вы еще ничего не выбрали. Время побаловать себя!
              </p>
            </div>
            <Button asChild className="rounded-2xl px-8 h-12 font-bold shadow-lg">
              <Link href="/">Вернуться в меню</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-[2.5rem] border-none shadow-sm p-6 space-y-6">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 sm:gap-6 items-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-muted/30">
                      <SmallPlaceholder category={item.item.category} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-black text-sm sm:text-base uppercase tracking-tight leading-tight">{item.item.name}</h4>
                          <span className="font-black text-sm sm:text-base whitespace-nowrap text-primary">{item.priceAtSelection * item.quantity} сум</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {item.size && `Объем: ${item.size}`}
                          {item.size && item.milk && " • "}
                          {item.milk && `Молоко: ${item.milk}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center border rounded-xl bg-muted/10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none" 
                            onClick={() => updateQuantity(item.cartId, -1)}
                            disabled={isSubmitting}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none" 
                            onClick={() => updateQuantity(item.cartId, 1)}
                            disabled={isSubmitting}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.cartId)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4 sticky top-24">
              <div className="bg-card rounded-[2.5rem] border-none shadow-md p-8 space-y-6">
                <h3 className="font-black text-xl uppercase tracking-tighter">Итог заказа</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50 flex items-center gap-2">
                      <User className="w-3 h-3" /> Ваше имя *
                    </Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Введите ваше имя"
                      className="h-12 rounded-xl bg-muted/50 border-none px-4 font-bold"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Сумма</span>
                    <span>{totalPrice} сум</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Доставка</span>
                    <span className="text-primary">Бесплатно</span>
                  </div>
                  <Separator className="bg-muted/50" />
                  <div className="flex justify-between text-2xl font-black tracking-tighter pt-2">
                    <span>Всего</span>
                    <span className="text-primary">{totalPrice} сум</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full rounded-2xl h-14 font-black text-base shadow-lg shadow-primary/20 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      ОФОРМИТЬ ЗАКАЗ
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
