'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, ArrowLeft, MoreVertical, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, query, orderBy, getDocs } = await import('firebase/firestore');
        const { firebaseConfig } = await import('@/firebase/config');
        
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);

        const ordersQuery = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt = data.createdAt;
          if (createdAt && typeof createdAt === 'object' && 'seconds' in createdAt) {
            createdAt = new Date(createdAt.seconds * 1000);
          }
          return { id: doc.id, ...data, createdAt } as Order;
        });
        setOrders(ordersData);

        const staffSnapshot = await getDocs(collection(firestore, 'staff'));
        const staffData = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
        setStaff(staffData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId: string, staffId: string) => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { firebaseConfig } = await import('@/firebase/config');
      
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);

      const staffMember = staff.find(s => s.id === staffId);
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'accepted',
        acceptedBy: staffMember?.name || staffId,
        acceptedAt: new Date()
      });

      toast({ title: 'Заказ принят' });
      setShowStaffSelector(false);
      setSelectedOrder(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { firebaseConfig } = await import('@/firebase/config');
      
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);

      await updateDoc(doc(firestore, 'orders', orderId), { status: 'rejected' });
      toast({ title: 'Заказ отклонен' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    }
  };

  const filteredOrders = orders.filter(order => order.status === activeTab);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-black text-xl uppercase tracking-tighter">УПРАВЛЕНИЕ <span className="text-primary">ЗАКАЗАМИ</span></h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Фильтры */}
        <div className="flex bg-muted p-1.5 rounded-2xl sm:rounded-[2rem] gap-1">
          {(['pending', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                "flex-1 py-3 px-2 rounded-xl sm:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === status 
                  ? "bg-primary text-white shadow-lg scale-[1.02]" 
                  : "text-muted-foreground hover:bg-black/5"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <span>{status === 'pending' ? 'Ожидает' : status === 'accepted' ? 'Принят' : 'Отказ'}</span>
                <Badge variant={activeTab === status ? "secondary" : "outline"} className="px-1.5 h-4 text-[8px] border-none bg-white/20">
                  {orders.filter(o => o.status === status).length}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Список */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Синхронизация...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-[2.5rem] border border-dashed border-muted-foreground/20">
              <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm font-bold text-muted-foreground">Заказы не найдены</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-card transition-all active:scale-[0.98]">
                <CardHeader className="p-6 pb-0 flex flex-row justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">ЗАКАЗ #{order.id.slice(-4)}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {order.createdAt instanceof Date ? order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button size="sm" variant="destructive" className="rounded-xl h-10 w-10 p-0" onClick={() => handleRejectOrder(order.id)}>
                          <XCircle className="w-5 h-5" />
                        </Button>
                        <Button size="sm" className="rounded-xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSelectedOrder(order); setShowStaffSelector(true); }}>
                          <CheckCircle className="w-4 h-4 mr-2" /> ПРИНЯТЬ
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-6">
                  {/* Клиент */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm uppercase tracking-tight">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone || 'Номер не указан'}</p>
                    </div>
                  </div>

                  {/* Состав */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">СОСТАВ ЗАКАЗА</p>
                    <div className="grid gap-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex gap-2 items-baseline">
                            <span className="font-black text-primary min-w-[1rem]">{item.quantity}×</span>
                            <span className="font-bold">{item.name}</span>
                            {item.selectedSize && <span className="text-[10px] font-black text-muted-foreground uppercase">({item.selectedSize})</span>}
                          </div>
                          <span className="font-black">{(item.sizePrice || item.price) * item.quantity} сум</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Подвал карточки */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Итоговая сумма</div>
                    <div className="text-xl font-black text-primary tracking-tighter">{order.totalAmount} сум</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Модалка выбора персонала */}
        {showStaffSelector && selectedOrder && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-10">
            <Card className="w-full max-w-sm rounded-[2.5rem] border-none shadow-2xl p-6 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter">ВЫБОР ОФИЦИАНТА</h3>
                <p className="text-xs text-muted-foreground">Кто будет обслуживать заказ #{selectedOrder.id.slice(-4)}?</p>
              </div>
              <div className="grid gap-2 max-h-[40vh] overflow-y-auto no-scrollbar">
                {staff.filter(s => s.isActive).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    onClick={() => handleAcceptOrder(selectedOrder.id, s.id)}
                    className="h-14 rounded-2xl justify-start px-6 font-bold hover:bg-primary hover:text-white transition-all border-none bg-muted/50"
                  >
                    <User className="w-4 h-4 mr-3 opacity-50" />
                    {s.name}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-muted-foreground" onClick={() => { setShowStaffSelector(false); setSelectedOrder(null); }}>
                ОТМЕНА
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
