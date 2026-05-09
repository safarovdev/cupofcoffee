
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
import { ShieldAlert, Plus, Trash2, LogOut, Loader2, Database, AlertCircle, KeyRound, Mail } from 'lucide-react';
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
    if (!auth) return;
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в панель управления.' });
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка входа', 
        description: error.code === 'auth/user-not-found' ? 'Пользователь не найден' : 'Неверный логин или пароль' 
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
      toast({ title: 'Успех', description: 'Все товары успешно перенесены в базу данных!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'У вас нет прав для записи в БД.' });
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
      <div className="h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md p-8 space-y-6 rounded-[2.5rem] shadow-2xl border-none">
          <div className="bg-primary/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <CardHeader className="p-0 text-center">
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Вход для профи</CardTitle>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">AromaFlow Admin</p>
          </CardHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="admin@aromaflow.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-11 h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Пароль</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-11 h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                  required 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSigningIn}
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSigningIn ? <Loader2 className="animate-spin" /> : "Войти в систему"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md p-10 text-center space-y-6 rounded-[3rem] border-2 border-destructive/20 shadow-2xl bg-card">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Доступ закрыт</h2>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Вы успешно вошли как <strong>{user.email}</strong>, но этого аккаунта нет в списке разрешенных администраторов.
            </p>
            <div className="bg-muted p-4 rounded-2xl text-[11px] font-mono break-all mt-6 select-all border border-border">
              UID: {user.uid}
            </div>
            <p className="text-[10px] text-muted-foreground italic mt-4 px-4">
              Чтобы получить доступ, добавьте этот UID в коллекцию <b>"admins"</b> через Firebase Console.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-2xl border-2 font-bold hover:bg-muted">Выйти из аккаунта</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6 backdrop-blur-md bg-card/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-black uppercase tracking-tighter text-xl">Aroma<span className="text-primary">Flow</span> Admin</h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2 rounded-full font-bold text-muted-foreground hover:text-destructive">
          <LogOut className="w-4 h-4" /> Выйти
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-accent/10 p-6 rounded-[2rem] border border-accent/20">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Контроль меню</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Всего позиций: {menuItems?.length || 0}</p>
          </div>
          <Button onClick={handleMigrate} disabled={isMigrating} variant="default" className="gap-2 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/10">
            <Database className="w-4 h-4" /> {isMigrating ? 'Загрузка...' : 'Наполнить базу данных'}
          </Button>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-[1.5rem] p-1.5 bg-muted h-14">
            <TabsTrigger value="items" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-sm">Список товаров</TabsTrigger>
            <TabsTrigger value="add" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-sm">Добавить новый</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-8 space-y-4">
            {menuLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Синхронизация...</span>
              </div>
            ) : menuItems?.length === 0 ? (
              <div className="text-center py-24 border-4 border-dashed rounded-[3rem] border-muted bg-muted/10 space-y-4">
                <p className="text-lg font-bold text-muted-foreground">База данных пуста</p>
                <p className="text-sm text-muted-foreground/60">Нажмите кнопку «Наполнить базу данных» выше.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems?.map(item => (
                  <Card key={item.id} className="flex items-center justify-between p-5 rounded-3xl border-none bg-card shadow-sm hover:shadow-md transition-all group">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-primary font-black uppercase text-xs">
                        {item.category.substring(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md text-muted-foreground">{item.category}</span>
                          <span className="text-sm font-black text-primary">{item.price} сум</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-8">
            <Card className="p-10 rounded-[3rem] border-none bg-card shadow-xl">
              <form className="space-y-8" onSubmit={(e) => {
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
                  toast({ title: 'Добавлено', description: 'Новый товар успешно создан и доступен на сайте.' });
                  (e.target as HTMLFormElement).reset();
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="uppercase tracking-widest text-[11px] font-black ml-1">Название продукта</Label>
                    <Input name="name" required className="rounded-2xl h-12 bg-muted/50 border-none px-5" placeholder="Напр: Раф Цитрус" />
                  </div>
                  <div className="space-y-3">
                    <Label className="uppercase tracking-widest text-[11px] font-black ml-1">Категория</Label>
                    <Input name="category" placeholder="coffee, tea, mojito..." required className="rounded-2xl h-12 bg-muted/50 border-none px-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="uppercase tracking-widest text-[11px] font-black ml-1">Цена (сум)</Label>
                  <Input name="price" type="number" required className="rounded-2xl h-12 bg-muted/50 border-none px-5" placeholder="25000" />
                </div>
                <div className="space-y-3">
                  <Label className="uppercase tracking-widest text-[11px] font-black ml-1">Описание для клиента</Label>
                  <Input name="description" className="rounded-2xl h-12 bg-muted/50 border-none px-5" placeholder="Нежный кофейный напиток с..." />
                </div>
                <div className="space-y-3">
                  <Label className="uppercase tracking-widest text-[11px] font-black ml-1">Ингредиенты (через запятую)</Label>
                  <Input name="ingredients" placeholder="Кофе, Сливки, Сироп апельсин..." className="rounded-2xl h-12 bg-muted/50 border-none px-5" />
                </div>
                <Button type="submit" className="w-full rounded-3xl h-16 font-black text-xl gap-3 shadow-xl shadow-primary/20 transition-transform active:scale-95">
                  <Plus className="w-6 h-6 stroke-[3]" /> СОЗДАТЬ ТОВАР
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
