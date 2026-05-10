
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldAlert, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminCheckoutPage() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
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

  const handleQuantityChange = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
    } else {
      updateQuantity(cartId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Корзина пуста' });
      return;
    }

    if (!customerInfo.name.trim()) {
      toast({ variant: 'destructive', title: 'Введите имя клиента' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, doc, setDoc, getDocs } = await import('firebase/firestore');
      const { firebaseConfig } = await import('@/firebase/config');
      
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);

      const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
      const orderCount = ordersSnapshot.size;
      const orderId = String(orderCount + 1).padStart(4, '0');

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
        createdAt: new Date(),
        createdBy: 'admin'
      };

      await setDoc(doc(firestore, 'orders', orderId), orderData);

      clearCart();
      localStorage.removeItem('customer-info');

      toast({ title: 'Заказ создан', description: `Заказ #${orderId} успешно отправлен` });
      router.push('/admin/orders');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось создать заказ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/menu" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-lg uppercase tracking-tight">Оформление <span className="text-primary">Admin</span></h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-32">
        {cart.length === 0 ? (
          <Card className="text-center py-12 rounded-[2.5rem] border-none shadow-sm">
            <CardContent>
              <p className="text-muted-foreground mb-4">Корзина пуста</p>
              <Link href="/admin/menu">
                <Button className="rounded-2xl">Перейти в меню</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-blue-50/50 border-blue-100 rounded-[2rem]">
              <CardContent className="p-6">
                <p className="text-blue-700 text-sm">Заказ будет отправлен в систему управления для принятия официантами.</p>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Состав заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((cartItem) => (
                  <div key={cartItem.cartId} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{cartItem.item.name}</p>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">{cartItem.size || 'Стандарт'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg" onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity - 1)} disabled={isSubmitting}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-black w-4 text-center">{cartItem.quantity}</span>
                        <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg" onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity + 1)} disabled={isSubmitting}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-black text-sm min-w-[80px] text-right">{cartItem.priceAtSelection * cartItem.quantity} сум</p>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive" onClick={() => removeFromCart(cartItem.cartId)} disabled={isSubmitting}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between items-center px-2">
                  <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Итого:</span>
                  <span className="text-xl font-black text-primary tracking-tighter">{totalPrice} сум</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Данные клиента</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Имя клиента *</Label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите имя"
                    className="h-14 rounded-2xl bg-muted/50 border-none px-6 font-bold"
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleCheckout} disabled={isSubmitting} className="w-full h-16 rounded-[1.8rem] font-black text-lg shadow-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              {isSubmitting ? 'СОЗДАНИЕ...' : `ОФОРМИТЬ ЗАКАЗ (${totalPrice} сум)`}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
