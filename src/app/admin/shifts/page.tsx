
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, Clock, User, Calendar, Loader2, Wallet, ShoppingBag } from 'lucide-react';
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

export default function ShiftStatsPage() {
  const firestore = useFirestore();

  const shiftsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'shifts'), orderBy('startTime', 'desc'));
  }, [firestore]);

  const { data: shifts, loading } = useCollection<Shift>(shiftsQuery as any);

  const formattedShifts = useMemo(() => {
    if (!shifts) return [];
    return shifts.map(s => {
      let start = s.startTime;
      let end = s.endTime;
      if (start && typeof start === 'object' && 'seconds' in start) {
        start = new Date(start.seconds * 1000);
      }
      if (end && typeof end === 'object' && 'seconds' in end) {
        end = new Date(end.seconds * 1000);
      }
      return { ...s, startTime: start, endTime: end };
    });
  }, [shifts]);

  const stats = useMemo(() => {
    const totalMin = formattedShifts.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalEarned = formattedShifts.reduce((acc, curr) => acc + (curr.totalEarnings || 0), 0);
    const totalOrders = formattedShifts.reduce((acc, curr) => acc + (curr.ordersCount || 0), 0);
    
    return {
      totalMinutes: totalMin,
      totalEarnings: totalEarned,
      totalOrders: totalOrders,
      shiftsCount: formattedShifts.length
    };
  }, [formattedShifts]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-black text-xl uppercase tracking-tighter">СТАТИСТИКА <span className="text-primary">СМЕН</span></h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Суммарная статистика */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm rounded-3xl bg-primary text-white p-6">
            <div className="flex items-center gap-2 opacity-60 mb-1">
              <Wallet className="w-3 h-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Всего выручка</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black">{loading ? '...' : stats.totalEarnings.toLocaleString()} сум</p>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-card p-6 border border-primary/10">
             <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingBag className="w-3 h-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Заказов принято</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-primary">{loading ? '...' : stats.totalOrders}</p>
          </Card>
        </div>

        {/* Список смен */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">ИСТОРИЯ РАБОТЫ</p>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Загрузка истории...</p>
            </div>
          ) : formattedShifts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-[2.5rem] opacity-30">Истории смен пока нет</div>
          ) : (
            <div className="space-y-4">
              {formattedShifts.map((s) => (
                <Card key={s.id} className="border-none shadow-md rounded-[2.5rem] bg-card overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                          s.endTime ? "bg-emerald-500" : "bg-orange-500"
                        )}>
                          {s.endTime ? <History className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-sm uppercase tracking-tight">{s.userName}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
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
                            <p className="font-black text-sm text-primary tracking-tight">{(s.totalEarnings || 0).toLocaleString()} сум</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Заказы</p>
                            <p className="font-black text-sm tracking-tight">{s.ordersCount || 0} зак.</p>
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
