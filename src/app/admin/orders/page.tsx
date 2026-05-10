
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, where, getDocs, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, ArrowLeft, Loader2, AlertTriangle, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStaffSelector, setShowStaffSelector] = useState(false);
  const [hasActiveShift, setHasActiveShift] = useState<boolean | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && firestore) {
      const q = query(
        collection(firestore, 'shifts'),
        where('userId', '==', user.uid),
        where('endTime', '==', null),
        limit(1)
      );
      
      const checkShift = async () => {
        const snap = await getDocs(q);
        setHasActiveShift(!snap.empty);
      };
      checkShift();
    }
  }, [user, firestore]);

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const staffQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'staff');
  }, [firestore]);

  const { data: rawOrders, loading: ordersLoading } = useCollection<Order>(ordersQuery as any);
  const { data: staffMembers } = useCollection<Staff>(staffQuery as any);

  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.map(order => {
      let createdAt = order.createdAt;
      if (createdAt && typeof createdAt === 'object' && 'seconds' in createdAt) {
        createdAt = new Date(createdAt.seconds * 1000);
      }
      return { ...order, createdAt };
    });
  }, [rawOrders]);

  const handleAcceptOrder = async (orderId: string, staffId: string) => {
    if (!firestore || !hasActiveShift) return;
    setUpdatingId(orderId);
    try {
      const staffMember = staffMembers?.find(s => s.id === staffId);
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
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!firestore) return;
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { status: 'rejected' });
      toast({ title: 'Заказ отклонен' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => order.status === activeTab);

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-black text-xl uppercase tracking-tighter">УПРАВЛЕНИЕ <span className="text-primary">ЗАКАЗАМИ</span></h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {hasActiveShift === false && (
          <Card className="bg-orange-50 border-orange-200 border-2 rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-orange-800 uppercase tracking-tight text-sm">Внимание! Смена не открыта</h3>
                <p className="text-xs text-orange-700 font-medium">Необходимо начать смену для принятия заказов.</p>
              </div>
              <Button onClick={() => router.push('/admin')} size="sm" className="bg-orange-600 rounded-xl h-10 px-6 font-bold">
                НАЧАТЬ СМЕНУ
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex bg-muted p-1.5 rounded-[2rem] gap-1">
          {(['pending', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                "flex-1 py-3 px-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === status ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-black/5"
              )}
            >
              <span>{status === 'pending' ? 'Ожидает' : status === 'accepted' ? 'Принят' : 'Отказ'}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {ordersLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Загрузка...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-[2.5rem] border border-dashed border-muted-foreground/20">
              <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm font-bold text-muted-foreground">Заказы не найдены</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-card animate-in slide-in-from-bottom-4 duration-300">
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
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="rounded-xl h-10 w-10 p-0" 
                          onClick={() => handleRejectOrder(order.id)}
                          disabled={updatingId === order.id}
                        >
                          {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={!hasActiveShift || updatingId === order.id}
                          className={cn(
                            "rounded-xl h-10 px-4",
                            hasActiveShift ? "bg-emerald-600 hover:bg-emerald-700" : "bg-muted text-muted-foreground"
                          )} 
                          onClick={() => { setSelectedOrder(order); setShowStaffSelector(true); }}
                        >
                          {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} 
                          ПРИНЯТЬ
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
                    <User className="w-5 h-5 text-primary opacity-50" />
                    <div className="flex-1">
                      <p className="font-black text-sm uppercase tracking-tight">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex gap-2 items-baseline">
                          <span className="font-black text-primary">{item.quantity}×</span>
                          <span className="font-bold">{item.name}</span>
                        </div>
                        <span className="font-black">{(item.sizePrice || item.price) * item.quantity} сум</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Итого</div>
                    <div className="text-xl font-black text-primary tracking-tighter">{order.totalAmount} сум</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {showStaffSelector && selectedOrder && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
            <Card className="w-full max-w-sm rounded-[2.5rem] border-none shadow-2xl p-6 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter">ВЫБОР ОФИЦИАНТА</h3>
              </div>
              <div className="grid gap-2 max-h-[40vh] overflow-y-auto no-scrollbar">
                {staffMembers?.filter(s => s.isActive).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    onClick={() => handleAcceptOrder(selectedOrder.id, s.id)}
                    className="h-14 rounded-2xl justify-start px-6 font-bold hover:bg-primary hover:text-white border-none bg-muted/50"
                  >
                    {updatingId === selectedOrder.id ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <User className="w-4 h-4 mr-3 opacity-50" />}
                    {s.name}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" className="w-full h-14 rounded-2xl" onClick={() => { setShowStaffSelector(false); setSelectedOrder(null); }}>
                ОТМЕНА
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
