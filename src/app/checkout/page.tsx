'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, User, Phone } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
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

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Только имя обязательно, телефон и примечания - необязательны
    if (!customerInfo.name.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }

    setIsSubmitting(true);

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
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
        createdAt: serverTimestamp(),
        acceptedBy: null,
        acceptedAt: null,
        createdBy: 'customer'
      };

      console.log('Creating order:', orderData); // Debug log
      console.log('Firebase app initialized:', app); // Debug log
      console.log('Firestore instance:', firestore); // Debug log
      console.log('Collection reference:', collection(firestore, 'orders')); // Debug log
      
      // Получаем текущее количество заказов для создания последовательного ID
        const { getDocs } = await import('firebase/firestore');
        const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
        const orderCount = ordersSnapshot.size;
        const orderId = String(orderCount + 1).padStart(4, '0'); // Формат: 0001, 0002 и т.д.
        
        console.log('Creating order with sequential ID:', orderId); // Debug log
        
        const { doc, setDoc } = await import('firebase/firestore');
        const docRef = doc(firestore, 'orders', orderId);
        await setDoc(docRef, orderData);
        
        console.log('Order created with ID:', orderId); // Debug log
        console.log('Order document path:', docRef.path); // Debug log

      // Очищаем корзину и данные клиента после оформления заказа
      cart.forEach(cartItem => {
        removeFromCart(cartItem.cartId);
      });
      
      // Очищаем данные клиента из localStorage
      localStorage.removeItem('customer-info');

      // Перенаправляем на страницу подтверждения
      router.push('/order-confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
            <p className="text-muted-foreground mb-6">Добавьте товары в корзину для оформления заказа</p>
            <Link href="/">
              <Button className="rounded-xl h-12 px-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в меню
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в меню
          </Link>
        </div>

        <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tighter mb-8">
          Оформление заказа
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список товаров */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((cartItem) => (
                  <div key={cartItem.cartId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{cartItem.item.name}</h4>
                      <p className="text-sm text-muted-foreground">{cartItem.item.category}</p>
                      {cartItem.size && (
                        <p className="text-sm text-primary">Размер: {cartItem.size}</p>
                      )}
                      <p className="font-bold text-primary">
                        {cartItem.priceAtSelection * cartItem.quantity} сум
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{cartItem.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(cartItem.cartId, cartItem.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-primary">{totalPrice} сум</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Форма клиента */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Ваши данные
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Введите ваше имя"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-xl h-12 font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
