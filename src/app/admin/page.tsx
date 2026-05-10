'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShieldAlert, 
  LogOut, 
  Loader2, 
  ShoppingCart, 
  Users, 
  Settings, 
  Home, 
  Clock, 
  Plus,
  RefreshCcw,
  Coffee,
  LayoutDashboard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [stats, setStats] = useState({
    newOrders: 0,
    totalOrders: 0,
    staffCount: 0,
    menuItemsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Вход выполнен' });
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка входа', 
        description: error.message || 'Проверьте данные.' 
      });
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

  const seedDatabase = async () => {
    if (!firestore) return;
    setIsInitializing(true);
    try {
      const batch = writeBatch(firestore);
      const demoItems = [
        { id: 'latte', name: 'Латте', category: 'coffee', price: 25000, description: 'Нежный кофе с молоком', ingredients: ['Эспрессо', 'Молоко'], rating: 5.0, time: '5 мин' },
        { id: 'cappuccino', name: 'Капучино', category: 'coffee', price: 22000, description: 'Классический кофейный напиток', ingredients: ['Эспрессо', 'Молоко'], rating: 4.8, time: '5 мин' },
        { id: 'croissant', name: 'Круассан', category: 'bakery', price: 15000, description: 'Свежая выпечка', ingredients: ['Тесто', 'Масло'], rating: 4.9, time: '2 мин' }
      ];

      demoItems.forEach(item => {
        const docRef = doc(firestore, 'menu', item.id);
        batch.set(docRef, item);
      });

      await batch.commit();
      toast({ title: 'База данных обновлена' });
      loadStats();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setIsInitializing(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm rounded-[2.5rem] shadow-2xl border-none p-2">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="bg-primary w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-14 rounded-2xl bg-muted/50 border-none px-6"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Пароль</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-14 rounded-2xl bg-muted/50 border-none px-6"
                  required 
                />
              </div>
              <Button disabled={isSigningIn} className="w-full h-16 rounded-2xl font-black text-lg shadow-lg mt-4">
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-sm w-full p-6 text-center rounded-[2.5rem] border-none shadow-2xl">
          <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Доступ ограничен</h2>
          <p className="text-sm text-muted-foreground mb-6">У вашего аккаунта нет прав администратора.</p>
          <div className="bg-muted p-4 rounded-2xl font-mono text-[10px] break-all mb-8 opacity-60">{user.uid}</div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleMakeMeAdmin} 
              disabled={isInitializing}
              className="w-full h-14 rounded-2xl bg-primary font-black"
            >
              {isInitializing ? <Loader2 className="animate-spin mr-2" /> : "ПОЛУЧИТЬ ПРАВА"}
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full h-14 rounded-2xl text-muted-foreground">Выйти</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="font-black text-xl uppercase tracking-tighter">ПАНЕЛЬ <span className="text-primary">УПРАВЛЕНИЯ</span></h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-full text-muted-foreground">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Новые', val: stats.newOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Всего', val: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Штат', val: stats.staffCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Меню', val: stats.menuItemsCount, icon: Coffee, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex items-center gap-3">
                <div className={`${item.bg} p-2.5 rounded-xl shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{item.label}</p>
                  <p className="text-xl font-black leading-none">{statsLoading ? '...' : item.val}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Навигация */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/admin/menu', title: 'Принять заказ', desc: 'Интерфейс официанта', icon: Home, color: 'bg-primary' },
            { href: '/admin/orders', title: 'Заказы', desc: 'Управление потоком', icon: ShoppingCart, color: 'bg-emerald-600' },
            { href: '/admin/staff', title: 'Персонал', desc: 'Ваша команда', icon: Users, color: 'bg-purple-600' },
            { href: '/admin/settings', title: 'Товары', desc: 'Редактор меню', icon: Settings, color: 'bg-orange-600' },
          ].map((item, i) => (
            <Link href={item.href} key={i}>
              <Card className="hover:scale-[1.02] active:scale-95 transition-all border-none rounded-[2.5rem] bg-card shadow-md h-full">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className={`${item.color} w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Сервис */}
        <Card className="border-none shadow-md rounded-[2.5rem] bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter">СЕРВИСНЫЕ ФУНКЦИИ</h3>
              <p className="text-sm text-muted-foreground">Настройка и обслуживание базы данных</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={seedDatabase} disabled={isInitializing} variant="outline" className="rounded-2xl h-14 px-8 border-primary/20 bg-background font-bold text-xs uppercase tracking-widest">
                {isInitializing ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 w-4 h-4" />}
                НАПОЛНИТЬ БАЗУ
              </Button>
              <Button onClick={loadStats} variant="outline" className="rounded-2xl h-14 px-8 border-primary/20 bg-background font-bold text-xs uppercase tracking-widest">
                <RefreshCcw className="mr-2 w-4 h-4" />
                ОБНОВИТЬ
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
