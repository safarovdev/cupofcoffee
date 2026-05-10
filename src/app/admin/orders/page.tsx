'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    selectedSize?: string;
    sizePrice?: number;
  }>;
  totalAmount: number;
  totalItems: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  acceptedBy?: string | null | undefined;
  acceptedAt?: any;
  createdBy?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [showStaffSelector, setShowStaffSelector] = useState(false);

  // Загрузка заказов
  useEffect(() => {
    const loadOrders = async () => {
      console.log('Starting to load orders...'); // Debug log
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc } = await import('firebase/firestore');
        
        const config = {
          apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
          authDomain: "coffee-f4bc1.firebaseapp.com",
          projectId: "coffee-f4bc1",
          storageBucket: "coffee-f4bc1.firebasestorage.app",
          messagingSenderId: "847730890494",
          appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
          measurementId: "G-3XN7LXDTJJ"
        };
        
        console.log('Initializing Firebase app...'); // Debug log
        const app = getApps().length > 0 ? getApp() : initializeApp(config);
        const firestore = getFirestore(app);
        console.log('Firebase initialized, getting orders collection...'); // Debug log

        // Загружаем заказы
        const ordersQuery = query(
          collection(firestore, 'orders'),
          orderBy('createdAt', 'desc')
        );
        
        console.log('Executing orders query...'); // Debug log
        const ordersSnapshot = await getDocs(ordersQuery);
        console.log('Orders snapshot received, docs count:', ordersSnapshot.docs.length); // Debug log
        
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Order data:', data); // Debug logging
          
          // Правильно обрабатываем createdAt
          const createdAt = data.createdAt;
          let formattedCreatedAt = createdAt;
          
          // Если это Firebase Timestamp, конвертируем в Date
          if (createdAt && typeof createdAt === 'object' && 'seconds' in createdAt) {
            formattedCreatedAt = new Date(createdAt.seconds * 1000);
          } else if (createdAt instanceof Date) {
            formattedCreatedAt = createdAt;
          } else if (typeof createdAt === 'string') {
            formattedCreatedAt = new Date(createdAt);
          }
          
          return { 
            id: doc.id, 
            ...data,
            createdAt: formattedCreatedAt
          } as Order;
        });
        setOrders(ordersData);
        console.log('Orders loaded:', ordersData.length); // Debug logging
        console.log('Pending orders count:', ordersData.filter(o => o.status === 'pending').length); // Debug log

        // Загружаем персонал
        const staffSnapshot = await getDocs(collection(firestore, 'staff'));
        const staffData = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
        setStaff(staffData);
        
      } catch (error) {
        console.error('Error loading orders:', error);
        toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось загрузить заказы' });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    
    // Автообновление каждые 10 секунд
    const interval = setInterval(loadOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId: string, staffId: string) => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      
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

      const orderRef = doc(firestore, 'orders', orderId);
      const staffMember = staff.find(s => s.id === staffId);
      
      await updateDoc(orderRef, {
        status: 'accepted',
        acceptedBy: staffMember?.name || staffId,
        acceptedAt: new Date()
      });

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'accepted', acceptedBy: staffMember?.name || staffId, acceptedAt: new Date() }
          : order
      ));

      toast({ title: 'Заказ принят', description: `Заказ #${orderId} принят официантом ${staffMember?.name}` });
      setShowStaffSelector(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось принять заказ' });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      
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

      const orderRef = doc(firestore, 'orders', orderId);
      
      await updateDoc(orderRef, {
        status: 'rejected',
        acceptedBy: null,
        acceptedAt: null
      });

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'rejected', acceptedBy: null, acceptedAt: null }
          : order
      ));

      toast({ title: 'Заказ отклонен', description: `Заказ #${orderId} отклонен` });
      setShowStaffSelector(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось отклонить заказ' });
    }
  };

  const filteredOrders = orders.filter(order => order.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'accepted': return 'Принят';
      case 'rejected': return 'Отклонен';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в админку
          </Link>
        </div>

        <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tighter mb-8">
          Управление заказами
        </h1>

        {/* Вкладки статусов */}
        <div className="mb-6">
          <div className="flex space-x-2 p-1 bg-muted rounded-xl">
            {(['pending', 'accepted', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={activeTab === status ? "default" : "ghost"}
                onClick={() => setActiveTab(status as any)}
                className="rounded-xl px-4"
              >
                {getStatusText(status)}
                <Badge variant="secondary" className="ml-2">
                  {orders.filter(o => o.status === status).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Список заказов */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Загрузка заказов...</p>
              <p className="text-xs text-muted-foreground mt-2">Проверьте консоль для отладочной информации</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Заказы со статусом "{getStatusText(activeTab)}" не найдены</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Всего заказов: {orders.length} | 
                  Ожидают: {orders.filter(o => o.status === 'pending').length} | 
                  Приняты: {orders.filter(o => o.status === 'accepted').length}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Обновить страницу
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {order.createdAt instanceof Date 
                            ? order.createdAt.toLocaleString()
                            : new Date(order.createdAt?.seconds * 1000).toLocaleString()
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStaffSelector(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Принять
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          Отклонить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Информация о клиенте */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Клиент</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Имя:</span> {order.customerName}</p>
                        <p><span className="font-medium">Телефон:</span> {order.customerPhone}</p>
                        {order.customerNotes && (
                          <p><span className="font-medium">Примечания:</span> {order.customerNotes}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Информация о заказе</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Товаров:</span> {order.totalItems}</p>
                        <p><span className="font-medium">Сумма:</span> {order.totalAmount} сум</p>
                        {order.acceptedBy && (
                          <p><span className="font-medium">Принял:</span> {order.acceptedBy}</p>
                        )}
                        {order.acceptedAt && (
                          <p><span className="font-medium">Время принятия:</span> {
                            order.acceptedAt instanceof Date 
                              ? order.acceptedAt.toLocaleString()
                              : new Date(order.acceptedAt?.seconds * 1000).toLocaleString()
                          }</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Состав заказа */}
                  <div>
                    <h4 className="font-semibold mb-2">Состав заказа</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                          <div className="flex-1">
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
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Модальное окно выбора официанта */}
        {showStaffSelector && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Выберите официанта</h3>
              <div className="space-y-3">
                {staff.filter(s => s.isActive).map((staffMember) => (
                  <Button
                    key={staffMember.id}
                    variant="outline"
                    onClick={() => handleAcceptOrder(selectedOrder.id, staffMember.id)}
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {staffMember.name}
                  </Button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStaffSelector(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
