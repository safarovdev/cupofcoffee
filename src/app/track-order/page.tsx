'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Phone, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!orderId && !phone) {
      setError('Введите номер заказа или телефон');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
      
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

      let orderQuery;
      
      if (orderId) {
        // Поиск по ID заказа
        const orderDoc = await getDoc(doc(firestore, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrderData({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          setError('Заказ не найден');
        }
      } else if (phone) {
        // Поиск по телефону клиента
        orderQuery = query(
          collection(firestore, 'orders'),
          where('customerPhone', '==', phone)
        );
        
        const querySnapshot = await getDocs(orderQuery);
        if (querySnapshot.docs.length > 0) {
          // Берем последний заказ по этому телефону
          const latestOrder = querySnapshot.docs[querySnapshot.docs.length - 1];
          setOrderData({ id: latestOrder.id, ...latestOrder.data() });
        } else {
          setError('Заказы по этому номеру не найдены');
        }
      }
    } catch (error) {
      console.error('Error searching order:', error);
      setError('Произошла ошибка при поиске заказа');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'accepted': return 'Принят официантом';
      case 'rejected': return 'Отклонен';
      case 'completed': return 'Выполнен';
      default: return 'Неизвестный статус';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'accepted': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в меню
          </Link>
        </div>

        <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tighter mb-8 text-center">
          Отследить заказ
        </h1>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Поиск заказа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orderId">Номер заказа</Label>
              <Input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Введите номер заказа"
                className="rounded-xl"
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">или</div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 XX XXX-XX-XX"
                className="rounded-xl"
              />
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full rounded-xl h-12"
              disabled={loading}
            >
              {loading ? 'Поиск...' : 'Найти заказ'}
            </Button>

            {error && (
              <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {orderData && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(orderData.status)}
                Информация о заказе #{orderData.id.slice(-6)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Информация о клиенте</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Имя:</span> {orderData.customerName}</p>
                    <p><span className="font-medium">Телефон:</span> {orderData.customerPhone}</p>
                    {orderData.customerNotes && (
                      <p><span className="font-medium">Примечания:</span> {orderData.customerNotes}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Статус заказа</h3>
                  <div className={`text-lg font-semibold ${getStatusColor(orderData.status)}`}>
                    {getStatusText(orderData.status)}
                  </div>
                  {orderData.acceptedBy && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Принял: {orderData.acceptedBy}
                    </p>
                  )}
                  {orderData.acceptedAt && (
                    <p className="text-sm text-muted-foreground">
                      Время принятия: {new Date(orderData.acceptedAt?.seconds * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Состав заказа</h3>
                <div className="space-y-2">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        {item.selectedSize && (
                          <p className="text-sm text-primary">Размер: {item.selectedSize}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">x{item.quantity}</p>
                        <p className="text-primary">
                          {item.selectedSize && item.sizePrice 
                            ? `${item.sizePrice} сум` 
                            : `${item.price} сум`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого:</span>
                  <span className="text-primary">{orderData.totalAmount} сум</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
