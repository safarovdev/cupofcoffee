
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useUser, useCollection } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, query, getDocs, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Plus, Trash2, LogOut, Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Текущие данные для миграции
const INITIAL_MENU = [
  { id: "c1", name: "Эспрессо", category: "coffee", description: "Классический крепкий кофе с плотной пенкой.", ingredients: ["Кофе"], price: 15000, sizes: { "Простой": 15000, "Двойной": 25000 }, rating: 4.9, time: "3 мин" },
  { id: "c2", name: "Американо", category: "coffee", description: "Эспрессо с добавлением горячей воды.", ingredients: ["Кофе", "Вода"], price: 20000, sizes: { "Простой": 20000, "Двойной": 30000 }, rating: 4.7, time: "4 мин" },
  { id: "c3", name: "Капучино", category: "coffee", description: "Кофе с воздушной молочной пенкой.", ingredients: ["Кофе", "Молоко"], price: 25000, sizes: { "Простой": 25000, "Двойной": 35000 }, rating: 4.8, time: "5 мин" },
  { id: "m1", name: "Мохито Классик", category: "mojito", description: "Лайм, свежая мята и содовая.", ingredients: ["Лайм", "Мята", "Содовая"], price: 35000, rating: 4.9, time: "5 мин" },
  // ... (остальные данные добавятся через кнопку миграции)
];

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const menuQuery = collection(firestore!, 'menu');
  const { data: menuItems, loading: menuLoading } = useCollection(menuQuery);

  useEffect(() => {
    if (user && firestore) {
      // Проверка, является ли пользователь админом
      const adminDoc = doc(firestore, 'admins', user.uid);
      getDocs(query(collection(firestore, 'admins'))).then(snapshot => {
        const isUserAdmin = snapshot.docs.some(doc => doc.id === user.uid);
        setIsAdmin(isUserAdmin);
      });
    } else {
      setIsAdmin(null);
    }
  }, [user, firestore]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка входа', description: 'Не удалось войти.' });
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
      toast({ title: 'Успех', description: 'Данные успешно перенесены в Firestore!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка миграции', description: 'Проверьте права доступа.' });
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

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center p-8 space-y-6">
          <ShieldAlert className="w-16 h-16 mx-auto text-primary" />
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase">Вход в админку</CardTitle>
          </CardHeader>
          <Button onClick={handleLogin} className="w-full h-12 rounded-xl font-bold">Войти через Google</Button>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4 border-destructive">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">Доступ запрещен</h2>
          <p className="text-muted-foreground text-sm">Ваш UID: {user.uid}. Добавьте этот ID в коллекцию admins в Firebase Console.</p>
          <Button onClick={handleLogout} variant="outline">Выйти</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b p-4 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="font-black uppercase tracking-tighter">AromaFlow Admin</h1>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
          <LogOut className="w-4 h-4" /> Выйти
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Управление меню</h2>
          <Button onClick={handleMigrate} disabled={isMigrating} variant="outline" className="gap-2">
            <Database className="w-4 h-4" /> {isMigrating ? 'Загрузка...' : 'Мигрировать старт. данные'}
          </Button>
        </div>

        <Tabs defaultValue="items">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="items" className="rounded-lg">Товары ({menuItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="add" className="rounded-lg">Добавить новый</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6 space-y-4">
            {menuLoading ? <Loader2 className="animate-spin mx-auto" /> : menuItems?.map(item => (
              <Card key={item.id} className="flex items-center justify-between p-4 shadow-sm">
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.category} • {item.price} сум</p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <Card className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newItem = {
                  id: Date.now().toString(),
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  price: Number(formData.get('price')),
                  description: formData.get('description') as string,
                  ingredients: (formData.get('ingredients') as string).split(',').map(i => i.trim()),
                  rating: 5.0,
                  time: "5 мин"
                };
                setDoc(doc(firestore!, 'menu', newItem.id), newItem);
                toast({ title: 'Добавлено', description: 'Товар успешно создан!' });
                (e.target as HTMLFormElement).reset();
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Input name="category" placeholder="coffee, tea, etc." required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Цена (сум)</Label>
                  <Input name="price" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Input name="description" />
                </div>
                <div className="space-y-2">
                  <Label>Ингредиенты (через запятую)</Label>
                  <Input name="ingredients" />
                </div>
                <Button type="submit" className="w-full rounded-xl gap-2">
                  <Plus className="w-4 h-4" /> Создать товар
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
