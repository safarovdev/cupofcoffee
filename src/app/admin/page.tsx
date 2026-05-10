
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser, useCollection } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Plus, Trash2, LogOut, Loader2, Database, AlertCircle, KeyRound, Mail, AlertTriangle, Edit, ShoppingCart, Users, Settings, Home, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategorySelector } from '@/components/CategorySelector';
import { EditableProductCard } from '@/components/EditableProductCard';
import { AddProductForm } from '@/components/AddProductForm';
import Link from 'next/link';


export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Статистика для дашборда - упрощенная
  const [stats, setStats] = useState({
    newOrders: 0,
    totalOrders: 0,
    staffCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      console.log('Loading admin stats...');
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        
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

        // Загружаем заказы
        console.log('Fetching orders...');
        const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
        console.log('Orders fetched:', ordersSnapshot.size);
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        const newOrders = orders.filter(o => o.status === 'pending').length;
        const totalOrders = orders.length;

        // Загружаем персонал
        console.log('Fetching staff...');
        const staffSnapshot = await getDocs(collection(firestore, 'staff'));
        console.log('Staff fetched:', staffSnapshot.size);
        const staffCount = staffSnapshot.docs.length;

        console.log('Stats loaded:', { newOrders, totalOrders, staffCount });

        setStats({
          newOrders,
          totalOrders,
          staffCount
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        // Всегда сбрасываем загрузку, даже при ошибке
        setStatsLoading(false);
      }
    };

    // Загружаем статистику сразу
    loadStats();
    
    // Обновляем статистику каждые 10 секунд
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        
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
        
        const querySnapshot = await getDocs(collection(firestore, 'menu'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setMenuItems(items);
        console.log(`Admin: Loaded ${items.length} menu items`);
      } catch (error) {
        console.error('Admin: Error loading menu items:', error);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  useEffect(() => {
    if (editingItem) {
      // Небольшая задержка, чтобы форма успела отрендериться
      const timer = setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
          const categoryInput = form.querySelector('select[name="category"]') as HTMLSelectElement;
          const priceInput = form.querySelector('input[name="price"]') as HTMLInputElement;
          const descriptionInput = form.querySelector('input[name="description"]') as HTMLInputElement;
          const ingredientsInput = form.querySelector('input[name="ingredients"]') as HTMLInputElement;
          const sizesInput = form.querySelector('input[name="sizes"]') as HTMLInputElement;
          
          if (nameInput) nameInput.value = editingItem.name || '';
          if (categoryInput) categoryInput.value = editingItem.category || '';
          if (priceInput) priceInput.value = editingItem.price || '';
          if (descriptionInput) descriptionInput.value = editingItem.description || '';
          if (ingredientsInput) ingredientsInput.value = editingItem.ingredients ? editingItem.ingredients.join(', ') : '';
          
          // Формируем строку размеров
          if (editingItem.sizes && Object.keys(editingItem.sizes).length > 0 && sizesInput) {
            const sizesString = Object.entries(editingItem.sizes)
              .map(([size, price]) => `${size}:${price}`)
              .join(', ');
            sizesInput.value = sizesString;
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [editingItem]);

  useEffect(() => {
    async function checkAdmin() {
      if (user && firestore) {
        try {
          const adminDocRef = doc(firestore, 'admins', user.uid);
          const adminDoc = await getDoc(adminDocRef);
          setIsAdmin(adminDoc.exists());
        } catch (e) {
          console.error("Admin check failed", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
      }
    }
    checkAdmin();
  }, [user, firestore]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    try {
      // Initialize Firebase directly
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
      
      const firebaseConfig = {
        apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
        authDomain: "coffee-f4bc1.firebaseapp.com",
        projectId: "coffee-f4bc1",
        storageBucket: "coffee-f4bc1.firebasestorage.app",
        messagingSenderId: "847730890494",
        appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
        measurementId: "G-3XN7LXDTJJ"
      };
      
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const auth = getAuth(app);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Проверяем, является ли пользователь администратором
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const firestore = getFirestore(app);
      const adminDocRef = doc(firestore, 'admins', userCredential.user.uid);
      const adminDoc = await getDoc(adminDocRef);
      setIsAdmin(adminDoc.exists());
      
      toast({ title: 'Успешный вход', description: 'Добро пожаловать в админ-панель!' });
    } catch (error: any) {
      console.error('Login error:', error);
      setIsSigningIn(false);
      
      if (error.code === 'auth/configuration-not-found') {
        toast({ 
          variant: 'destructive', 
          title: 'Ошибка конфигурации Firebase', 
          description: 'Email/password authentication не включена в Firebase Console. Включите в разделе Authentication → Sign-in method.' 
        });
      } else if (error.code === 'auth/invalid-credential') {
        toast({ 
          variant: 'destructive', 
          title: 'Неверные данные', 
          description: 'Проверьте email и пароль.' 
        });
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Ошибка входа', 
          description: error.message || 'Произошла ошибка при входе.' 
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      const { getApps, getApp } = await import('firebase/app');
      const { getAuth, signOut } = await import('firebase/auth');
      
      const app = getApps().length > 0 ? getApp() : null;
      if (app) {
        const authInstance = getAuth(app);
        await signOut(authInstance);
        toast({ title: 'Выход выполнен', description: 'Вы успешно вышли из системы.' });
      }
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка выхода', 
        description: 'Не удалось выйти из системы.' 
      });
    }
  };

  
  const handleDeleteItem = async (id: string) => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      
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
      
      await deleteDoc(doc(firestore, 'menu', id));
      
      // Обновляем локальный список
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Удалено', description: 'Товар успешно удален.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось удалить товар.' });
    }
  };

  const handleEditItem = (item: any) => {
    console.log('Edit button clicked for item:', item);
    setEditingItem(item);
    
    // Переключаем на вкладку редактирования
    setTimeout(() => {
      const editTab = document.querySelector('[value="edit"]') as HTMLElement;
      if (editTab && !editTab.disabled) {
        editTab.click();
        console.log('Switched to edit tab');
      }
    }, 100);
  };

  const handleUpdateItem = async (id: string, data: any) => {
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
      
      const updatedItem = {
        ...data,
        rating: 5.0,
        time: "5 мин"
      };
      
      await updateDoc(doc(firestore, 'menu', id), updatedItem);
      
      // Обновляем локальный список
      setMenuItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      ));
      
      toast({ title: 'Обновлено', description: 'Товар успешно обновлен.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обновить товар.' });
    }
  };

  const parseSizes = (sizesString: string): { [key: string]: number } => {
    if (!sizesString) return {};
    
    const sizes: { [key: string]: number } = {};
    sizesString.split(',').forEach(size => {
      const [name, price] = size.trim().split(':');
      if (name && price) {
        sizes[name.trim()] = Number(price.trim());
      }
    });
    return sizes;
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
        <Card className="w-full max-w-[380px] p-6 sm:p-8 space-y-6 rounded-[2rem] border-none shadow-2xl bg-card">
          <CardHeader className="p-0 text-center space-y-2">
            <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold uppercase tracking-tight">Панель управления</CardTitle>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Используется Firebase Auth</p>
          </CardHeader>

          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Email (Firebase)</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="admin@mail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-11 h-11 rounded-xl bg-muted/50 border-none"
                  required 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Пароль</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-11 h-11 rounded-xl bg-muted/50 border-none"
                  required 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSigningIn}
              className="w-full h-12 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              {isSigningIn ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Войти"}
            </Button>
          </form>
          
          <p className="text-center text-[9px] text-muted-foreground leading-relaxed italic px-4">
            * Учетные данные из Supabase не подойдут автоматически. Создайте такого же пользователя в Firebase Console.
          </p>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-3xl border-2 border-destructive/10 shadow-lg bg-card">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-tight">Доступ ограничен</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Аккаунт <strong>{user.email}</strong> успешно вошел в систему, но его нет в списке разрешенных администраторов.
          </p>
          <div className="space-y-2">
             <p className="text-[10px] font-bold uppercase text-muted-foreground">Ваш уникальный ID (UID):</p>
             <div className="bg-muted p-3 rounded-xl text-[10px] font-mono select-all border break-all">
               {user.uid}
             </div>
             <p className="text-[9px] text-muted-foreground italic">
               Добавьте этот UID в коллекцию "admins" в Firestore Database.
             </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-12 font-bold">Выйти из аккаунта</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg uppercase tracking-tight">cupofcoffee <span className="text-primary">Admin</span></h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="rounded-full h-9 px-4 text-muted-foreground hover:text-destructive gap-2">
          <LogOut className="w-4 h-4" /> Выход
        </Button>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Новые заказы</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center">
                    <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">{stats.newOrders}</p>
                )}
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                )}
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Сотрудники</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-purple-600">{stats.staffCount}</p>
                )}
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Навигационные карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/menu">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Меню</CardTitle>
                <p className="text-muted-foreground text-sm">Просмотр и управление меню как у клиентов</p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Заказы</CardTitle>
                <p className="text-muted-foreground text-sm">Управление заказами клиентов</p>
                {stats.newOrders > 0 && (
                  <div className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2">
                    {stats.newOrders} новых
                  </div>
                )}
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Персонал</CardTitle>
                <p className="text-muted-foreground text-sm">Управление официантами</p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                  <Settings className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Товары</CardTitle>
                <p className="text-muted-foreground text-sm">Управление меню и товарами</p>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Быстрые действия */}
        <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10">
          <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/orders">
              <Button className="rounded-xl">
                {stats.newOrders > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                    {stats.newOrders}
                  </span>
                )}
                Посмотреть заказы
              </Button>
            </Link>
            <Link href="/admin/menu">
              <Button variant="outline" className="rounded-xl">Сделать заказ</Button>
            </Link>
            <Link href="/admin/staff">
              <Button variant="outline" className="rounded-xl">Управление персоналом</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
