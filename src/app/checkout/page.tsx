
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, User, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCustomerInfo = localStorage.getItem('customer-info');
        if (savedCustomerInfo) {
          const parsedInfo = JSON.parse(savedCustomerInfo);
          if (parsedInfo.name !== undefined) {
            setCustomerInfo({ name: parsedInfo.name || '' });
          }
        }
      } catch (error) {
        console.error('Error loading customer info:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer-info', JSON.stringify(customerInfo));
    }
  }, [customerInfo]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name.trim()) {
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
        customerName: customerInfo.name,
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
      localStorage.removeItem('customer-info');

      toast({
        title: 'Заказ успешно оформлен!',
        description: `Ваш заказ #${orderId} принят кофейней.`,
      });

      // Сразу переходим на главную
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Корзина пуста</h1>
          <Link href="/">
            <Button className="rounded-2xl h-12 px-8 font-bold">Вернуться в меню</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <header className="bg-background/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/cart" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-primary" />
        </Link>
        <h1 className="font-black text-lg uppercase tracking-tight">Оформление</h1>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tighter">Ваш заказ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((cartItem) => (
                <div key={cartItem.cartId} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm uppercase tracking-tight">{cartItem.item.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {cartItem.size || 'Стандарт'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity - 1)}
                        className="h-8 w-8 rounded-lg"
                        disabled={isSubmitting}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center font-black text-xs">{cartItem.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity + 1)}
                        className="h-8 w-8 rounded-lg"
                        disabled={isSubmitting}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-black text-sm text-primary min-w-[80px] text-right">
                      {cartItem.priceAtSelection * cartItem.quantity} сум
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Итого к оплате</span>
                <span className="text-2xl font-black text-primary tracking-tighter">{totalPrice} сум</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tighter">
                <User className="w-5 h-5 text-primary" />
                Ваши данные
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Имя *</Label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ name: e.target.value })}
                    placeholder="Как к вам обращаться?"
                    className="h-14 rounded-2xl bg-muted/50 border-none px-6 font-bold"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-[1.8rem] font-black text-lg shadow-lg shadow-primary/20 mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'ОФОРМЛЯЕМ...' : 'ОФОРМИТЬ ЗАКАЗ'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
