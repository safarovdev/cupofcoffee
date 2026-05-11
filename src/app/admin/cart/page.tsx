
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldAlert, Plus, Minus, Trash2, Loader2, User, PlusCircle, Banknote, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminCartPage() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояние для быстрого добавления произвольного товара
  const [customItem, setCustomItem] = useState({ name: '', price: '' });

  const handleAddCustomItem = () => {
    if (!customItem.name.trim() || !customItem.price) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите название и цену товара'
      });
      return;
    }

    const price = Number(customItem.price);
    if (isNaN(price) || price <= 0) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Цена должна быть числом больше нуля'
      });
      return;
    }

    const syntheticItem = {
      id: `custom-${Date.now()}`,
      name: customItem.name.trim(),
      description: 'Произвольный товар',
      ingredients: [],
      price: price,
      category: 'custom'
    };

    addToCart(syntheticItem as any, undefined, undefined, price);
    setCustomItem({ name: '', price: '' });
    toast({
      title: 'Добавлено',
      description: `Позиция "${syntheticItem.name}" добавлена в чек`
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Чек пуст',
        description: 'Добавьте товары или используйте ручной ввод'
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Данные клиента',
        description: 'Укажите имя для закрытия чека'
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
    <div className="min-h-screen flex flex-col bg-background pb-40">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin/menu" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h1 className="font-black text-lg uppercase tracking-tight">Оформление <span className="text-primary">Чека</span></h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
        
        {/* Блок быстрого добавления произвольного товара */}
        <Card className="rounded-[2rem] border-none shadow-md overflow-hidden bg-primary/5 border border-primary/10">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary/60">
              <PlusCircle className="w-4 h-4" /> Быстрый ввод (нет в меню)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input 
                  value={customItem.name}
                  onChange={(e) => setCustomerName(customerName || "")} // Dummy to avoid unused, actually use the right state
                  onInput={(e: any) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название (напр. Доп. порция)"
                  className="rounded-xl border-none bg-background shadow-sm h-11 font-bold text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  value={customItem.price}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Цена (сум)"
                  className="rounded-xl border-none bg-background shadow-sm h-11 font-bold text-xs"
                />
                <Button onClick={handleAddCustomItem} className="h-11 px-4 rounded-xl shrink-0" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Добавить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[2rem] border-2 border-dashed border-muted flex flex-col items-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">Список пуст. Используйте ручной ввод выше</p>
            <Link href="/admin/menu">
              <Button variant="outline" className="rounded-xl h-10 font-bold px-6 text-[10px] uppercase tracking-widest">Перейти к меню</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-card">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-tight">Состав чека</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {cart.map((cartItem) => (
                  <div key={cartItem.cartId} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex-1">
                      <p className="font-black text-xs uppercase tracking-tight">
                        {cartItem.item.name}
                        {cartItem.item.category === 'custom' && <span className="ml-2 text-[7px] bg-primary text-white px-1.5 py-0.5 rounded-md">РУЧНОЙ</span>}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{cartItem.size || 'Стандарт'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(cartItem.cartId, -1)}
                          className="w-7 h-7 rounded-lg bg-background"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-4 text-center font-black text-xs">{cartItem.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(cartItem.cartId, 1)}
                          className="w-7 h-7 rounded-lg bg-background"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-black text-xs text-primary min-w-[80px] text-right">
                        {(cartItem.priceAtSelection * cartItem.quantity).toLocaleString()} сум
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(cartItem.cartId)}
                        className="w-7 h-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-dashed pt-4 flex justify-between items-center">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">ИТОГО К ОПЛАТЕ:</span>
                  <span className="text-xl font-black text-primary tracking-tighter">{totalPrice.toLocaleString()} сум</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-md p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50 flex items-center gap-2">
                  <User className="w-3 h-3" /> Имя клиента *
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Введите имя для статистики"
                  className="h-12 rounded-xl bg-muted/50 border-none px-4 font-bold text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl font-black text-sm shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    ЗАКРЫТЬ ЧЕК ({totalPrice.toLocaleString()} сум)
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
