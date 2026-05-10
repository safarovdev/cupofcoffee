'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      
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

      const ordersQuery = query(
        collection(firestore, 'orders'),
        orderBy('createdAt', 'desc')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw order data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt
        };
      });
      
      setOrders(ordersData);
      console.log('Loaded orders:', ordersData.length);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось загрузить заказы' });
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async () => {
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

      const testOrder = {
        customerName: 'Тестовый клиент',
        customerPhone: '+998901234567',
        customerNotes: 'Тестовый заказ',
        items: [
          {
            id: 'test-item-1',
            name: 'Тестовый кофе',
            price: 15000,
            quantity: 2,
            category: 'Кофе',
            selectedSize: null,
            sizePrice: null
          }
        ],
        totalAmount: 30000,
        totalItems: 2,
        status: 'pending',
        createdAt: serverTimestamp(),
        acceptedBy: null,
        acceptedAt: null,
        createdBy: 'test'
      };

      console.log('Creating test order:', testOrder);
      console.log('Firebase app initialized:', app); // Debug log
      console.log('Firestore instance:', firestore); // Debug log
      console.log('Collection reference:', collection(firestore, 'orders')); // Debug log
      
      let docRef;
      try {
        docRef = await addDoc(collection(firestore, 'orders'), testOrder);
        console.log('Test order created with ID:', docRef.id);
        console.log('Test order document path:', docRef.path);
      } catch (addDocError) {
        console.error('Error in addDoc for test order:', addDocError);
        throw addDocError;
      }

      toast({ title: 'Тестовый заказ создан', description: `ID: ${docRef.id}` });
      loadOrders(); // Перезагружаем список
    } catch (error) {
      console.error('Error creating test order:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось создать тестовый заказ' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в админку
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Тестирование заказов</h1>

        <div className="space-y-6">
          {/* Кнопка создания тестового заказа */}
          <Card>
            <CardHeader>
              <CardTitle>Создать тестовый заказ</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={createTestOrder} className="mr-4">
                Создать тестовый заказ
              </Button>
              <Button onClick={loadOrders} variant="outline">
                Обновить список
              </Button>
            </CardContent>
          </Card>

          {/* Список заказов */}
          <Card>
            <CardHeader>
              <CardTitle>Заказы в базе ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Загрузка...</p>
              ) : orders.length === 0 ? (
                <p>Заказов нет</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">Заказ #{order.id.slice(-6)}</h3>
                      <p><strong>Клиент:</strong> {order.customerName}</p>
                      <p><strong>Телефон:</strong> {order.customerPhone}</p>
                      <p><strong>Статус:</strong> {order.status}</p>
                      <p><strong>Сумма:</strong> {order.totalAmount} сум</p>
                      <p><strong>Создан:</strong> {order.createdAt ? 
                        (order.createdAt instanceof Date 
                          ? order.createdAt.toLocaleString()
                          : new Date(order.createdAt?.seconds * 1000).toLocaleString()
                        ) : 'Нет даты'
                      }</p>
                      <p><strong>Товаров:</strong> {order.totalItems}</p>
                      <div className="mt-2">
                        <strong>Состав:</strong>
                        <ul className="ml-4">
                          {order.items?.map((item: any, index: number) => (
                            <li key={index}>
                              {item.name} x{item.quantity} - {item.price} сум
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
