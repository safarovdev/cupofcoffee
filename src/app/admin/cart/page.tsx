
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldAlert, Plus, Minus, Trash2, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminCartPage() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Корзина пуста',
        description: 'Добавьте товары перед оформлением'
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Заполните данные',
        description: 'Укажите имя клиента'
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
        createdBy: 'admin'
      };

      await setDoc(doc(firestore, 'orders', orderId), orderData);

      clearCart();
      toast({
        title: 'Заказ создан',
        description: `Заказ #${orderId} успешно добавлен в систему`
      });

      router.push('/admin/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось создать заказ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin/menu" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h1 className="font-black text-lg uppercase tracking-tight">Корзина <span className="text-primary">Admin</span></h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-bold mb-6">В корзине пусто</p>
            <Link href="/admin/menu">
              <Button className="rounded-2xl h-12 font-bold px-8">Перейти в меню</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Состав заказа</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                {cart.map((cartItem) => (
                  <div key={cartItem.cartId} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                    <div className="flex-1">
                      <p className="font-black text-sm uppercase tracking-tight">{cartItem.item.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cartItem.size || 'Стандарт'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(cartItem.cartId, -1)}
                          className="w-8 h-8 rounded-lg"
                          disabled={isSubmitting}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-4 text-center font-black text-xs">{cartItem.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(cartItem.cartId, 1)}
                          className="w-8 h-8 rounded-lg"
                          disabled={isSubmitting}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-black text-sm text-primary min-w-[80px] text-right">
                        {cartItem.priceAtSelection * cartItem.quantity} сум
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(cartItem.cartId)}
                        className="w-8 h-8 text-destructive hover:bg-destructive/10"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Итог:</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">{totalPrice} сум</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-md p-8 space-y-6">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Данные клиента</CardTitle>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50 flex items-center gap-2">
                    <User className="w-3 h-3" /> Имя клиента *
                  </Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Введите имя клиента"
                    className="h-14 rounded-2xl bg-muted/50 border-none px-6 font-bold"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </Card>

            <Button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full h-16 rounded-[1.8rem] font-black text-lg shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                `ОФОРМИТЬ ЗАКАЗ (${totalPrice} сум)`
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
