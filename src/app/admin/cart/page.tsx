'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldAlert, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminCartPage() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Корзина пуста',
        description: 'Добавьте товары в корзину перед оформлением заказа'
      });
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Заполните данные клиента',
        description: 'Укажите имя и телефон клиента'
      });
      return;
    }

    try {
      // Создаем заказ в Firebase
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
      
      const config = {
        apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
        authDomain: "coffee-f4bc1.firebaseapp.com",
        projectId: "coffee-f4bc1",
        storageBucket: "coffee-f4bc1.firebasestorage.app",
        messagingSenderId: "847730890494",
        appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
        measurementId: "G-3XN7LXDTJJ"
      };
      
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const firestore = getFirestore(app);

      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerNotes: customerInfo.notes || undefined,
        items: cart.map(cartItem => ({
          id: cartItem.item.id,
          name: cartItem.item.name,
          price: cartItem.priceAtSelection,
          quantity: cartItem.quantity,
          category: cartItem.item.category,
          selectedSize: cartItem.size,
          sizePrice: cartItem.size ? cartItem.priceAtSelection : undefined
        })),
        totalAmount: totalPrice,
        totalItems: totalItems,
        status: 'pending',
        createdAt: new Date(),
        createdBy: 'admin'
      };

      const orderId = `order-${Date.now()}`;
      await setDoc(doc(firestore, 'orders', orderId), orderData);

      // Очищаем корзину
      clearCart();

      toast({
        title: 'Заказ создан',
        description: `Заказ #${orderId.slice(-6)} успешно отправлен в систему`
      });

      // Перенаправляем на страницу заказов
      router.push('/admin/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось создать заказ'
      });
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
            <h1 className="font-bold text-lg uppercase tracking-tight">Корзина <span className="text-primary">Admin</span></h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {cart.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-current rounded-sm" />
                </div>
                <p className="text-lg mb-2">Корзина пуста</p>
                <p className="text-sm mb-4">Добавьте товары из меню</p>
                <Link href="/admin/menu">
                  <Button>Перейти в меню</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Информационная карточка */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-800">Оформление заказа</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-sm">
                  Заполните данные клиента для создания заказа. Заказ будет отправлен в систему управления заказами для принятия официантами.
                </p>
              </CardContent>
            </Card>

            {/* Состав заказа */}
            <Card>
              <CardHeader>
                <CardTitle>Состав заказа ({totalItems} шт.)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((cartItem) => (
                  <div key={cartItem.cartId} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{cartItem.item.name}</p>
                      <p className="text-sm text-muted-foreground">{cartItem.item.category}</p>
                      {cartItem.size && (
                        <p className="text-sm text-primary">Размер: {cartItem.size}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold">
                          {cartItem.priceAtSelection * cartItem.quantity} сум
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(cartItem.cartId)}
                        className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-primary">{totalPrice} сум</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Данные клиента */}
            <Card>
              <CardHeader>
                <CardTitle>Данные клиента</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Имя клиента *</Label>
                  <Input
                    id="customerName"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите имя клиента"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Телефон клиента *</Label>
                  <Input
                    id="customerPhone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+998 XX XXX-XX-XX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerNotes">Примечания</Label>
                  <Input
                    id="customerNotes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Дополнительные пожелания"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Кнопка оформления */}
            <Button 
              onClick={handleCheckout}
              className="w-full h-12 rounded-xl font-bold"
              size="lg"
            >
              Создать заказ ({totalPrice} сум)
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
