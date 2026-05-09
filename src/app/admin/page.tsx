
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser, useCollection } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Plus, Trash2, LogOut, Loader2, Database, AlertCircle, KeyRound, Mail, AlertTriangle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategorySelector } from '@/components/CategorySelector';
import { EditableProductCard } from '@/components/EditableProductCard';
import { AddProductForm } from '@/components/AddProductForm';


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
      
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      
      await signInWithEmailAndPassword(authInstance, email, password);
      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в AromaFlow Admin.' });
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      let message = "Неверный логин или пароль.";
      if (error.code === 'auth/invalid-api-key') message = "Недействительный API ключ Firebase.";
      if (error.code === 'auth/network-request-failed') message = "Ошибка сети. Проверьте соединение.";
      if (error.code === 'auth/configuration-not-found') message = "Firebase Auth не настроен. Включите Email/Password в Firebase Console.";
      if (error.code === 'auth/user-not-found') message = "Пользователь не найден. Сначала создайте администратора.";
      if (error.code === 'auth/wrong-password') message = "Неверный пароль.";
      
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка входа', 
        description: message 
      });
    } finally {
      setIsSigningIn(false);
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
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg uppercase tracking-tight">AromaFlow <span className="text-primary">Admin</span></h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="rounded-full h-9 px-4 text-muted-foreground hover:text-destructive gap-2">
          <LogOut className="w-4 h-4" /> Выход
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-accent/5 p-6 rounded-3xl border border-accent/10">
          <div>
            <h2 className="text-xl font-bold">Управление меню</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Активных позиций в облаке: {menuItems?.length || 0}</p>
          </div>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-muted h-12">
            <TabsTrigger value="items" className="rounded-xl font-bold text-xs">Все товары</TabsTrigger>
            <TabsTrigger value="add" className="rounded-xl font-bold text-xs">Добавить новый</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6 space-y-3">
            {menuLoading ? (
              <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-3">
                {menuItems?.map(item => (
                  <EditableProductCard
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
                {menuItems?.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    База данных пуста. Нажмите кнопку выше, чтобы добавить базовые товары.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <AddProductForm onAdd={async (data) => {
              try {
                const { initializeApp, getApps, getApp } = await import('firebase/app');
                const { getFirestore, doc, setDoc } = await import('firebase/firestore');
                
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
                
                const newItem = {
                  id: `item-${Date.now()}`,
                  ...data,
                  rating: 5.0,
                  time: "5 мин"
                };
                
                await setDoc(doc(firestore, 'menu', newItem.id), newItem);
                
                setMenuItems(prev => [...prev, newItem]);
                toast({ title: 'Добавлено', description: 'Новый товар успешно создан.' });
              } catch (error) {
                toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось создать товар.' });
              }
            }} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
