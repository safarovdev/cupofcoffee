
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Loader2, Package, Search, Edit } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AddProductForm } from '@/components/AddProductForm';

export default function AdminProductsPage() {
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Все']);

  const loadMenuItems = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'menu'));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const uniqueCategories = ['Все', ...new Set(items.map((item: any) => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({ variant: 'destructive', title: 'Ошибка загрузки' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, [firestore]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteItem = async (id: string) => {
    if (!firestore || !confirm('Удалить этот товар?')) return;
    try {
      await deleteDoc(doc(firestore, 'menu', id));
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Товар удален' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка удаления' });
    }
  };

  const handleAddItem = async (data: any) => {
    if (!firestore) return;
    try {
      const id = data.id || `item-${Date.now()}`;
      await setDoc(doc(firestore, 'menu', id), {
        ...data,
        rating: 5.0,
        time: "5 мин"
      });
      setShowAddDialog(false);
      loadMenuItems();
      toast({ title: 'Товар добавлен' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-black text-2xl uppercase tracking-tighter">Управление товарами</h1>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-4 py-2 rounded-full">
          {menuItems.length} позиций
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-none shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full px-6 h-14 font-bold"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-bold uppercase tracking-widest text-muted-foreground">Загрузка товаров...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[2.5rem] py-24">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <Package className="w-20 h-20 text-muted-foreground/20" />
              <p className="text-xl font-bold uppercase tracking-tighter">Товары не найдены</p>
              <Button onClick={() => setShowAddDialog(true)} className="rounded-2xl h-12">Добавить первый товар</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="group overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  <Package className="w-12 h-12 text-primary/10" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <Button size="icon" className="rounded-xl h-12 w-12 bg-white text-primary hover:bg-white/90">
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="rounded-xl h-12 w-12"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
                    <p className="text-xl font-black text-primary">{item.price} сум</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Button 
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-28 right-6 lg:bottom-12 rounded-[2rem] h-20 px-10 shadow-2xl font-black text-xl gap-4 animate-in slide-in-from-bottom-10"
      >
        <Plus className="w-8 h-8" />
        Добавить товар
      </Button>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Новый товар</DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <AddProductForm onAdd={handleAddItem} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
