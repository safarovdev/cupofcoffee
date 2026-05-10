'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldAlert, Plus, Minus, Trash2 } from 'lucide-react';
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

  // Загружаем данные клиента из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCustomerInfo = localStorage.getItem('customer-info');
        if (savedCustomerInfo) {
          const parsedInfo = JSON.parse(savedCustomerInfo);
          // Миграция данных: если старая структура с phone/notes, берем только name
          if (parsedInfo.name !== undefined) {
            setCustomerInfo({
              name: parsedInfo.name || ''
            });
          } else {
            // Если структура совсем другая, используем пустые значения
            setCustomerInfo({
              name: ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading customer info from localStorage:', error);
        // При ошибке загружаем пустые значения
        setCustomerInfo({
          name: ''
        });
      }
    }
  }, []);

  // Сохраняем данные клиента в localStorage при изменениях
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('customer-info', JSON.stringify(customerInfo));
      } catch (error) {
        console.error('Error saving customer info to localStorage:', error);
      }
    }
  }, [customerInfo]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
    } else {
      updateQuantity(cartId, newQuantity);
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

    // Только имя обязательно, телефон и примечания - необязательны
    if (!customerInfo.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Введите имя клиента',
        description: 'Имя клиента обязательно для оформления заказа'
      });
      return;
    }

    setIsSubmitting(true);

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
        createdBy: 'admin',
        acceptedBy: null,
        acceptedAt: null
      };

      // Получаем текущее количество заказов для создания последовательного ID
      const { getDocs } = await import('firebase/firestore');
      const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
      const orderCount = ordersSnapshot.size;
      const orderId = String(orderCount + 1).padStart(4, '0'); // Формат: 0001, 0002 и т.д.
      
      console.log('Creating admin order with sequential ID:', orderId); // Debug log
      console.log('Firebase app initialized:', app); // Debug log
      console.log('Firestore instance:', firestore); // Debug log
      console.log('Document reference:', doc(firestore, 'orders', orderId)); // Debug log
      
      try {
        await setDoc(doc(firestore, 'orders', orderId), orderData);
        console.log('Admin order created with ID:', orderId); // Debug log
        console.log('Order document path:', `orders/${orderId}`); // Debug log
      } catch (setDocError) {
        console.error('Error in setDoc:', setDocError);
        throw setDocError;
      }

      // Очищаем корзину и данные клиента
      clearCart();
      
      // Очищаем данные клиента из localStorage
      localStorage.removeItem('customer-info');

      toast({
        title: 'Заказ создан',
        description: `Заказ #${orderId} успешно отправлен в систему`
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/cart" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-lg uppercase tracking-tight">Оформление заказа <span className="text-primary">Admin</span></h1>
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
                  />
                </div>
              </CardContent>
            </Card>

            {/* Кнопка оформления */}
            <Button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-bold"
              size="lg"
            >
              {isSubmitting ? 'Создание заказа...' : `Создать заказ (${totalPrice} сум)`}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
