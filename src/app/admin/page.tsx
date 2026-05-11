'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs, setDoc, query, where, addDoc, updateDoc, serverTimestamp, limit, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShieldAlert, 
  LogOut, 
  Loader2, 
  ShoppingCart, 
  Users, 
  Settings, 
  Home, 
  Clock, 
  Play,
  Square,
  LayoutDashboard,
  BarChart3,
  Coffee,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const [activeShift, setActiveShift] = useState<any>(null);
  const [shiftDuration, setShiftDuration] = useState("00:00:00");

  const [stats, setStats] = useState({
    newOrders: 0,
    totalOrders: 0,
    staffCount: 0,
    menuItemsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const loadStats = async () => {
    if (!firestore) return;
    try {
      const [ordersSnap, staffSnap, menuSnap] = await Promise.all([
        getDocs(collection(firestore, 'orders')),
        getDocs(collection(firestore, 'staff')),
        getDocs(collection(firestore, 'menu'))
      ]);

      const orders = ordersSnap.docs.map(doc => doc.data());
      setStats({
        newOrders: orders.filter(o => o.status === 'pending').length,
        totalOrders: ordersSnap.size,
        staffCount: staffSnap.size,
        menuItemsCount: menuSnap.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

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
        if (!snap.empty) {
          setActiveShift({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setActiveShift(null);
        }
      };
      checkShift();
    }
  }, [user, firestore]);

  useEffect(() => {
    let interval: any;
    if (activeShift && activeShift.startTime) {
      interval = setInterval(() => {
        let start;
        if (activeShift.startTime instanceof Timestamp) {
          start = activeShift.startTime.toDate();
        } else if (activeShift.startTime?.seconds) {
          start = new Date(activeShift.startTime.seconds * 1000);
        } else {
          start = new Date(activeShift.startTime);
        }
        
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        
        setShiftDuration(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setShiftDuration("00:00:00");
    }
    return () => clearInterval(interval);
  }, [activeShift]);

  useEffect(() => {
    if (user && firestore) {
      const checkAdmin = async () => {
        try {
          const adminDoc = await getDoc(doc(firestore, 'admins', user.uid));
          setIsAdmin(adminDoc.exists());
          if (adminDoc.exists()) {
            loadStats();
          }
        } catch (e) {
          setIsAdmin(false);
        }
      };
      checkAdmin();
    } else if (!authLoading) {
      setIsAdmin(null);
    }
  }, [user, firestore, authLoading]);

  const handleStartShift = async () => {
    if (!firestore || !user) return;
    setIsInitializing(true);
    try {
      const docRef = await addDoc(collection(firestore, 'shifts'), {
        userId: user.uid,
        userName: user.email || 'Admin',
        startTime: serverTimestamp(),
        endTime: null,
        durationMinutes: 0,
        totalEarnings: 0,
        ordersCount: 0
      });
      const newShift = await getDoc(docRef);
      setActiveShift({ id: docRef.id, ...newShift.data() });
      toast({ title: 'Смена открыта', description: 'Теперь вы можете принимать заказы' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка при открытии смены' });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleFinishShift = async () => {
    if (!firestore || !activeShift) return;
    setIsInitializing(true);
    try {
      let start;
      if (activeShift.startTime instanceof Timestamp) {
        start = activeShift.startTime.toDate();
      } else if (activeShift.startTime?.seconds) {
        start = new Date(activeShift.startTime.seconds * 1000);
      } else {
        start = new Date(activeShift.startTime);
      }
      
      const end = new Date();
      const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
      
      const ordersSnap = await getDocs(collection(firestore, 'orders'));
      let totalEarnings = 0;
      let ordersCount = 0;

      ordersSnap.forEach((doc) => {
        const orderData = doc.data();
        let orderCreated;
        
        if (orderData.createdAt instanceof Timestamp) {
          orderCreated = orderData.createdAt.toDate();
        } else if (orderData.createdAt?.seconds) {
          orderCreated = new Date(orderData.createdAt.seconds * 1000);
        } else {
          orderCreated = new Date(orderData.createdAt);
        }

        if (orderCreated >= start && orderData.status === 'accepted') {
          totalEarnings += Number(orderData.totalAmount) || 0;
          ordersCount++;
        }
      });
      
      await updateDoc(doc(firestore, 'shifts', activeShift.id), {
        endTime: serverTimestamp(),
        durationMinutes: durationMin,
        totalEarnings: totalEarnings,
        ordersCount: ordersCount
      });
      
      setActiveShift(null);
      toast({ 
        title: 'Смена закрыта', 
        description: `Итог: ${totalEarnings.toLocaleString()} сум (${ordersCount} зак.)` 
      });
    } catch (error) {
      console.error('Error closing shift:', error);
      toast({ variant: 'destructive', title: 'Ошибка при закрытии смены' });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Вход выполнен' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка входа' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  const handleMakeMeAdmin = async () => {
    if (!firestore || !user) return;
    setIsInitializing(true);
    try {
      await setDoc(doc(firestore, 'admins', user.uid), {
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      setIsAdmin(true);
      toast({ title: 'Права администратора получены!' });
      loadStats();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setIsInitializing(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm rounded-2xl shadow-xl border-none">
          <CardContent className="px-6 py-8">
            <div className="text-center mb-6">
              <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter">CupOfCoffee Admin</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl bg-muted/50 border-none px-4" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Пароль</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl bg-muted/50 border-none px-4" required />
              </div>
              <Button disabled={isSigningIn} className="w-full h-13 rounded-xl font-black text-sm shadow-lg mt-3">
                {isSigningIn ? <Loader2 className="animate-spin" /> : "ВОЙТИ В ПАНЕЛЬ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-xs w-full p-6 text-center rounded-2xl border-none shadow-xl">
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tighter mb-2">Доступ ограничен</h2>
          <p className="text-xs text-muted-foreground mb-6 break-all">UID: {user.uid}</p>
          <Button onClick={handleMakeMeAdmin} disabled={isInitializing} className="w-full h-11 rounded-xl bg-primary font-black text-xs">
            {isInitializing ? <Loader2 className="animate-spin mr-2" /> : "ПОЛУЧИТЬ ПРАВА"}
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="w-full mt-2 h-11 rounded-xl text-muted-foreground text-xs">Выйти</Button>
        </Card>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/menu', title: 'Официант', desc: 'Меню', icon: Home, color: 'bg-primary' },
    { href: '/admin/orders', title: 'Заказы', desc: 'Активные', icon: ShoppingCart, color: 'bg-emerald-600' },
    { href: '/admin/settings', title: 'Склад', desc: 'Товары', icon: Package, color: 'bg-orange-600' },
    { href: '/admin/shifts', title: 'Финансы', desc: 'История', icon: BarChart3, color: 'bg-blue-600' },
    { href: '/admin/staff', title: 'Штат', desc: 'Команда', icon: Users, color: 'bg-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="font-black text-lg uppercase tracking-tighter">ПАНЕЛЬ <span className="text-primary">УПРАВЛЕНИЯ</span></h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground">
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Minimalist Shift Block */}
        <Card className={cn(
          "border-border/40 rounded-2xl overflow-hidden transition-all duration-300 border shadow-none",
          activeShift ? "bg-emerald-50/40" : "bg-orange-50/40"
        )}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                  activeShift ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"
                )}>
                  {activeShift ? <Clock className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </div>
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">
                    {activeShift ? "Текущая смена" : "Смена закрыта"}
                  </h2>
                  <p className={cn(
                    "text-xl font-mono font-black tracking-tighter",
                    activeShift ? "text-emerald-700" : "text-orange-700"
                  )}>
                    {shiftDuration}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={activeShift ? handleFinishShift : handleStartShift}
                disabled={isInitializing}
                variant={activeShift ? "outline" : "default"}
                className={cn(
                  "h-11 px-6 rounded-xl font-black text-[10px] w-full sm:w-auto uppercase tracking-widest border-2",
                  activeShift 
                    ? "border-destructive/20 text-destructive hover:bg-destructive hover:text-white" 
                    : "bg-emerald-600 hover:bg-emerald-700 border-transparent"
                )}
              >
                {isInitializing ? <Loader2 className="animate-spin w-4 h-4" /> : (
                  <div className="flex items-center gap-2">
                    {activeShift ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    {activeShift ? "Завершить" : "Открыть смену"}
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Новые', val: stats.newOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50/50' },
            { label: 'Всего', val: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50/50' },
            { label: 'Штат', val: stats.staffCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50/50' },
            { label: 'Меню', val: stats.menuItemsCount, icon: Coffee, color: 'text-green-600', bg: 'bg-green-50/50' },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-none bg-muted/30 rounded-xl">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`${item.bg} p-2 rounded-lg shrink-0`}>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{item.label}</p>
                  <p className="text-sm font-black leading-none">{statsLoading ? '...' : item.val}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {navItems.map((item, i) => {
            const isNavigating = navigatingTo === item.href;
            return (
              <Link 
                href={item.href} 
                key={i}
                onClick={() => setNavigatingTo(item.href)}
                className="block h-full"
              >
                <Card className={cn(
                  "hover:bg-muted/50 transition-all border-none rounded-2xl bg-card shadow-none h-full border border-border/20",
                  isNavigating && "animate-pulse opacity-80"
                )}>
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      item.color, 
                      "w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    )}>
                      {isNavigating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <item.icon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{item.title}</h3>
                      <p className="text-[8px] text-muted-foreground font-medium uppercase opacity-50">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
