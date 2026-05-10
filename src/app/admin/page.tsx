
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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
  Coffee
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
        description: error.message || 'Проверьте данные или права доступа.' 
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

  const seedDatabase = async () => {
    if (!firestore) return;
    setIsInitializing(true);
    try {
      const batch = writeBatch(firestore);
      const demoItems = [
        { id: 'latte', name: 'Латте', category: 'coffee', price: 25000, description: 'Нежный кофе с молоком', ingredients: ['Эспрессо', 'Молоко'], rating: 5.0, time: '5 мин' },
        { id: 'cappuccino', name: 'Капучино', category: 'coffee', price: 22000, description: 'Классический кофейный напиток', ingredients: ['Эспрессо', 'Молоко'], rating: 4.8, time: '5 мин' },
        { id: 'americano', name: 'Американо', category: 'coffee', price: 18000, description: 'Крепкий черный кофе', ingredients: ['Эспрессо', 'Вода'], rating: 4.7, time: '3 мин' },
        { id: 'croissant', name: 'Круассан', category: 'bakery', price: 15000, description: 'Свежая выпечка', ingredients: ['Тесто', 'Масло'], rating: 4.9, time: '2 мин' }
      ];

      demoItems.forEach(item => {
        const docRef = doc(firestore, 'menu', item.id);
        batch.set(docRef, item);
      });

      await batch.commit();
      toast({ title: 'База данных обновлена', description: 'Демо-товары добавлены.' });
      loadStats();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обновить базу.' });
    } finally {
      setIsInitializing(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border-none">
          <CardHeader className="text-center space-y-2">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Admin Login</CardTitle>
            <p className="text-muted-foreground text-sm font-medium">Введите ваши данные для входа</p>
          </CardHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest ml-1">Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="h-12 rounded-2xl bg-muted/50 border-none"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest ml-1">Пароль</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-12 rounded-2xl bg-muted/50 border-none"
                required 
              />
            </div>
            <Button disabled={isSigningIn} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg">
              {isSigningIn ? <Loader2 className="animate-spin" /> : "Войти"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Card className="max-w-md p-8 text-center space-y-6 rounded-[2.5rem] border-none shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold uppercase tracking-tighter">Доступ ограничен</h2>
          <p className="text-muted-foreground">У вас нет прав администратора. Ваш UID:</p>
          <div className="bg-muted p-4 rounded-2xl font-mono text-xs break-all">{user.uid}</div>
          <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-2xl">Выйти</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="font-black text-xl uppercase tracking-tighter">AromaFlow <span className="text-primary">Admin</span></h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" className="rounded-full text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5 mr-2" /> Выход
        </Button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Новые заказы', val: stats.newOrders, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
            { label: 'Всего заказов', val: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100' },
            { label: 'Персонал', val: stats.staffCount, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
            { label: 'Товаров в меню', val: stats.menuItemsCount, icon: Coffee, color: 'text-green-500', bg: 'bg-green-100' },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[2rem]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                  <p className="text-3xl font-black mt-1">{statsLoading ? '...' : item.val}</p>
                </div>
                <div className={`${item.bg} p-3 rounded-2xl`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/menu">
            <Card className="hover:shadow-xl transition-all cursor-pointer group border-none rounded-[2.5rem] bg-card">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-primary/5 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Сделать заказ</h3>
                <p className="text-sm text-muted-foreground">Интерфейс для официанта</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="hover:shadow-xl transition-all cursor-pointer group border-none rounded-[2.5rem] bg-card">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-green-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Заказы</h3>
                <p className="text-sm text-muted-foreground">Управление активными заказами</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="hover:shadow-xl transition-all cursor-pointer group border-none rounded-[2.5rem] bg-card">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-purple-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Персонал</h3>
                <p className="text-sm text-muted-foreground">Управление сотрудниками</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-xl transition-all cursor-pointer group border-none rounded-[2.5rem] bg-card">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-orange-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Settings className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Товары</h3>
                <p className="text-sm text-muted-foreground">Редактирование меню</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="border-none shadow-sm rounded-[2.5rem] bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Сервисные функции</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={seedDatabase} disabled={isInitializing} variant="outline" className="rounded-2xl h-14 px-8 border-primary/20 bg-white">
              {isInitializing ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
              Наполнить базу демо-товарами
            </Button>
            <Button onClick={loadStats} variant="outline" className="rounded-2xl h-14 px-8 border-primary/20 bg-white">
              <RefreshCcw className="mr-2 w-4 h-4" />
              Обновить данные
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
