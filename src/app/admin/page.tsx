
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
import { ShieldAlert, Plus, Trash2, LogOut, Loader2, Database, AlertCircle, KeyRound, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INITIAL_MENU = [
  { id: "c1", name: "Эспрессо", category: "coffee", description: "Классический крепкий кофе с плотной пенкой.", ingredients: ["Кофе"], price: 15000, rating: 4.9, time: "3 мин" },
  { id: "c2", name: "Американо", category: "coffee", description: "Эспрессо с добавлением горячей воды.", ingredients: ["Кофе", "Вода"], price: 20000, rating: 4.7, time: "4 мин" },
  { id: "c3", name: "Капучино", category: "coffee", description: "Кофе с воздушной молочной пенкой.", ingredients: ["Кофе", "Молоко"], price: 25000, rating: 4.8, time: "5 мин" },
  { id: "m1", name: "Мохито Классик", category: "mojito", description: "Лайм, свежая мята и содовая.", ingredients: ["Лайм", "Мята", "Содовая"], price: 35000, rating: 4.9, time: "5 мин" },
];

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

  const { data: menuItems, loading: menuLoading } = useCollection(
    firestore ? collection(firestore, 'menu') : null
  );

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
    if (!auth) {
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка конфигурации', 
        description: 'Firebase не инициализирован. Проверьте настройки проекта.' 
      });
      return;
    }
    
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в AromaFlow Admin.' });
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      let message = "Неверный логин или пароль.";
      if (error.code === 'auth/invalid-api-key') message = "Недействительный API ключ Firebase.";
      if (error.code === 'auth/network-request-failed') message = "Ошибка сети. Проверьте соединение.";
      
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка входа', 
        description: message 
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = () => signOut(auth!);

  const handleMigrate = async () => {
    if (!firestore) return;
    setIsMigrating(true);
    try {
      const batch = writeBatch(firestore);
      INITIAL_MENU.forEach((item) => {
        const docRef = doc(firestore, 'menu', item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      toast({ title: 'Успех', description: 'База данных заполнена начальными данными.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка доступа', description: 'У вас нет прав на запись в базу данных.' });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, 'menu', id)).catch(() => {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось удалить товар.' });
    });
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

          {!auth && (
             <div className="bg-destructive/10 p-3 rounded-xl flex gap-2 items-start border border-destructive/20">
               <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
               <p className="text-[10px] text-destructive leading-tight font-medium">
                 Внимание: Firebase не настроен. Пожалуйста, убедитесь, что вы добавили ключи в src/firebase/config.ts.
               </p>
             </div>
          )}

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
              disabled={isSigningIn || !auth}
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
          <Button onClick={handleMigrate} disabled={isMigrating} size="sm" className="rounded-xl h-10 px-5 gap-2 shadow-sm">
            <Database className="w-4 h-4" /> {isMigrating ? 'Загрузка...' : 'Наполнить базу данных'}
          </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {menuItems?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-primary font-bold text-[10px] uppercase">
                        {item.category.substring(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                        <p className="text-xs font-bold text-primary">{item.price} сум</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {menuItems?.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    База данных пуста. Нажмите кнопку выше, чтобы добавить базовые товары.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <Card className="p-6 sm:p-8 rounded-3xl border shadow-lg bg-card">
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newItem = {
                  id: `item-${Date.now()}`,
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  price: Number(formData.get('price')),
                  description: formData.get('description') as string,
                  ingredients: (formData.get('ingredients') as string).split(',').map(i => i.trim()),
                  rating: 5.0,
                  time: "5 мин"
                };
                if (firestore) {
                  setDoc(doc(firestore, 'menu', newItem.id), newItem);
                  toast({ title: 'Добавлено', description: 'Новый товар успешно создан в облаке.' });
                  (e.target as HTMLFormElement).reset();
                }
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Название</Label>
                    <Input name="name" required className="rounded-xl h-11 bg-muted/50 border-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Категория</Label>
                    <Input name="category" placeholder="coffee, mojito, tea..." required className="rounded-xl h-11 bg-muted/50 border-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Цена (сум)</Label>
                  <Input name="price" type="number" required className="rounded-xl h-11 bg-muted/50 border-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Описание</Label>
                  <Input name="description" className="rounded-xl h-11 bg-muted/50 border-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Ингредиенты (через запятую)</Label>
                  <Input name="ingredients" placeholder="Молоко, Кофе, Сахар" className="rounded-xl h-11 bg-muted/50 border-none" />
                </div>
                <Button type="submit" className="w-full rounded-xl h-12 font-bold gap-2 shadow-lg shadow-primary/10">
                  <Plus className="w-4 h-4" /> СОЗДАТЬ ТОВАР
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
