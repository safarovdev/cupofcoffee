'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser, useCollection } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, query, getDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Plus, Trash2, LogOut, Loader2, Database, AlertCircle } from 'lucide-react';
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

  const { data: menuItems, loading: menuLoading } = useCollection(
    firestore ? collection(firestore, 'menu') : null
  );

  useEffect(() => {
    async function checkAdmin() {
      if (user && firestore) {
        const adminDocRef = doc(firestore, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      } else {
        setIsAdmin(null);
      }
    }
    checkAdmin();
  }, [user, firestore]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка входа', description: 'Не удалось авторизоваться.' });
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
      toast({ title: 'Успех', description: 'Меню перенесено в базу данных!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Недостаточно прав для записи.' });
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
        <Card className="w-full max-w-md text-center p-8 space-y-6 rounded-[2rem] shadow-2xl">
          <ShieldAlert className="w-16 h-16 mx-auto text-primary" />
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Вход для администратора</CardTitle>
          </CardHeader>
          <Button onClick={handleLogin} className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
            Войти через Google
          </Button>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-6 rounded-[2rem] border-destructive shadow-xl">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Доступ ограничен</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ваш аккаунт ({user.email}) не числится в списке администраторов.
            </p>
            <div className="bg-muted p-3 rounded-xl text-[10px] font-mono break-all mt-4">
              UID: {user.uid}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Добавьте этот UID в коллекцию "admins" в Firebase Console, чтобы получить доступ.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl">Выйти</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b p-4 sticky top-0 z-50 flex justify-between items-center px-6">
        <h1 className="font-black uppercase tracking-tighter text-primary">AromaFlow <span className="text-muted-foreground">Admin</span></h1>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2 rounded-full">
          <LogOut className="w-4 h-4" /> Выйти
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Управление товарами</h2>
          <Button onClick={handleMigrate} disabled={isMigrating} variant="outline" className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5">
            <Database className="w-4 h-4" /> {isMigrating ? 'Загрузка...' : 'Наполнить базу данных'}
          </Button>
        </div>

        <Tabs defaultValue="items">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-muted">
            <TabsTrigger value="items" className="rounded-xl data-[state=active]:shadow-sm">Товары ({menuItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="add" className="rounded-xl data-[state=active]:shadow-sm">Добавить новый</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6 space-y-4">
            {menuLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : menuItems?.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl text-muted-foreground">
                <p>База данных пуста. Нажмите кнопку выше для миграции или добавьте товар вручную.</p>
              </div>
            ) : (
              menuItems?.map(item => (
                <Card key={item.id} className="flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-primary font-black uppercase text-xs">
                      {item.category.substring(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.category} • {item.price} сум</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <Card className="p-8 rounded-[2rem] border-primary/10">
              <form className="space-y-6" onSubmit={(e) => {
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
                setDoc(doc(firestore!, 'menu', newItem.id), newItem);
                toast({ title: 'Добавлено', description: 'Новый товар успешно создан!' });
                (e.target as HTMLFormElement).reset();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] font-bold">Название</Label>
                    <Input name="name" required className="rounded-xl" placeholder="Напр: Раф Кофе" />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] font-bold">Категория</Label>
                    <Input name="category" placeholder="coffee, tea, mojito..." required className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] font-bold">Цена (сум)</Label>
                  <Input name="price" type="number" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] font-bold">Описание</Label>
                  <Input name="description" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] font-bold">Ингредиенты (через запятую)</Label>
                  <Input name="ingredients" placeholder="Кофе, молоко, сироп..." className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-2xl h-14 font-bold text-lg gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-5 h-5" /> Создать товар
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
