
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, Clock, User, Calendar, Loader2, Wallet, ShoppingBag, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: any;
  endTime: any;
  durationMinutes: number;
  totalEarnings?: number;
  ordersCount?: number;
}

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  items: any[];
}

export default function StatisticsPage() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<'shifts' | 'orders'>('shifts');

  const shiftsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'shifts'), orderBy('startTime', 'desc'));
  }, [firestore]);

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: shifts, loading: shiftsLoading } = useCollection<Shift>(shiftsQuery as any);
  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery as any);

  const formattedShifts = useMemo(() => {
    if (!shifts) return [];
    return shifts.map(s => {
      let start = s.startTime;
      let end = s.endTime;
      if (start instanceof Timestamp) start = start.toDate();
      else if (start?.seconds) start = new Date(start.seconds * 1000);
      
      if (end instanceof Timestamp) end = end.toDate();
      else if (end?.seconds) end = new Date(end.seconds * 1000);
      
      return { ...s, startTime: start, endTime: end };
    });
  }, [shifts]);

  const formattedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.map(o => {
      let created = o.createdAt;
      if (created instanceof Timestamp) created = created.toDate();
      else if (created?.seconds) created = new Date(created.seconds * 1000);
      return { ...o, createdAt: created };
    });
  }, [orders]);

  const stats = useMemo(() => {
    const totalEarned = formattedOrders
      .filter(o => o.status === 'accepted')
      .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
    
    const totalOrders = formattedOrders.filter(o => o.status === 'accepted').length;
    
    return {
      totalEarnings: totalEarned,
      totalOrders: totalOrders,
    };
  }, [formattedOrders]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-black text-xl uppercase tracking-tighter">СТАТИСТИКА</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Суммарная статистика */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm rounded-3xl bg-primary text-white p-6">
            <div className="flex items-center gap-2 opacity-60 mb-1">
              <Wallet className="w-3 h-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Общая выручка</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black">{ordersLoading ? '...' : stats.totalEarnings.toLocaleString()} сум</p>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-card p-6 border border-primary/10">
             <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingBag className="w-3 h-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Принято заказов</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-primary">{ordersLoading ? '...' : stats.totalOrders}</p>
          </Card>
        </div>

        {/* Переключатель вкладок */}
        <div className="flex bg-muted p-1.5 rounded-[2rem] gap-1">
          <button
            onClick={() => setActiveTab('shifts')}
            className={cn(
              "flex-1 py-3 px-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'shifts' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-black/5"
            )}
          >
            История смен
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "flex-1 py-3 px-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'orders' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-black/5"
            )}
          >
            История заказов
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="space-y-4">
          {activeTab === 'shifts' ? (
            <>
              {shiftsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-primary w-10 h-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Загрузка...</p>
                </div>
              ) : formattedShifts.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-[2.5rem] opacity-30">Истории смен пока нет</div>
              ) : (
                formattedShifts.map((s) => (
                  <Card key={s.id} className="border-none shadow-md rounded-[2.5rem] bg-card overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                            s.endTime ? "bg-emerald-500" : "bg-orange-500"
                          )}>
                            {s.endTime ? <History className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">{s.userName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={s.endTime ? "secondary" : "default"} className="text-[8px] font-black tracking-widest uppercase rounded-lg px-2">
                                {s.endTime ? "Завершена" : "В работе"}
                              </Badge>
                              {s.endTime && (
                                <p className="text-[10px] font-bold text-primary">{s.durationMinutes} мин</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {s.endTime && (
                          <div className="grid grid-cols-2 gap-4 border-t sm:border-t-0 sm:border-l sm:pl-6 pt-4 sm:pt-0">
                            <div>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Выручка</p>
                              <p className="font-black text-sm text-primary">{(s.totalEarnings || 0).toLocaleString()} сум</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Заказы</p>
                              <p className="font-black text-sm">{s.ordersCount || 0} зак.</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-start sm:items-end gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{s.startTime instanceof Date ? s.startTime.toLocaleDateString() : '...'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              {s.startTime instanceof Date ? s.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                              {s.endTime && s.endTime instanceof Date && ` — ${s.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          ) : (
            <>
              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-primary w-10 h-10" />
                </div>
              ) : formattedOrders.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-[2.5rem] opacity-30">Заказов пока нет</div>
              ) : (
                formattedOrders.map((order) => (
                  <Card key={order.id} className="border-none shadow-md rounded-[2.5rem] bg-card overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">ЗАКАЗ #{order.id.slice(-4)}</p>
                          <h4 className="font-black text-sm uppercase tracking-tight">{order.customerName}</h4>
                        </div>
                        <Badge variant={order.status === 'accepted' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[8px] font-black tracking-widest uppercase">
                          {order.status === 'accepted' ? 'ПРИНЯТ' : order.status === 'rejected' ? 'ОТКЛОНЕН' : 'ОЖИДАЕТ'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[11px] font-medium">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{((item.sizePrice || item.price) * item.quantity).toLocaleString()} сум</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t pt-4">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase">
                          <Calendar className="w-3 h-3" />
                          <span>{order.createdAt instanceof Date ? order.createdAt.toLocaleString() : '...'}</span>
                        </div>
                        <p className="text-lg font-black text-primary tracking-tighter">{(order.totalAmount || 0).toLocaleString()} сум</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
