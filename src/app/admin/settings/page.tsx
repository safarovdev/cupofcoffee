
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2, Package, Search } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AddProductForm } from '@/components/AddProductForm';
import { EditableProductCard } from '@/components/EditableProductCard';
import { cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'menu'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching menu:", error);
      toast({ variant: 'destructive', title: 'Ошибка загрузки' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const categories = ['Все', ...new Set(menuItems.map((item: any) => item.category).filter(Boolean))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteItem = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'menu', id));
      toast({ title: 'Товар удален' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка удаления' });
    }
  };

  const handleUpdateItem = async (data: any) => {
    const itemId = editingItem?.id;
    if (!firestore || !itemId) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'ID товара не найден' });
      return;
    }
    
    try {
      await setDoc(doc(firestore, 'menu', itemId), data, { merge: true });
      setEditingItem(null);
      toast({ title: 'Товар успешно обновлен' });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка обновления', 
        description: error.message || 'Проверьте соединение с интернетом'
      });
    }
  };

  const handleAddItem = async (data: any) => {
    if (!firestore) return;
    try {
      const id = `item-${Date.now()}`;
      await setDoc(doc(firestore, 'menu', id), {
        ...data,
        rating: 5.0,
        time: "5 мин"
      });
      setShowAddDialog(false);
      toast({ title: 'Товар добавлен' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: error.message });
    }
  };

  const categoryNames: Record<string, string> = {
    'Все': 'Все', 'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
    'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
    'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-black text-xl uppercase tracking-tighter">РЕДАКТОР <span className="text-primary">МЕНЮ</span></h1>
        </div>
        <Badge variant="secondary" className="rounded-full h-8 px-4 font-black bg-primary/10 text-primary border-none">
          {menuItems.length}
        </Badge>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30" />
            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-[1.5rem] bg-card border-none px-14 shadow-sm font-bold"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat 
                    ? "bg-primary text-white shadow-md scale-105" 
                    : "bg-card text-muted-foreground hover:bg-muted shadow-sm"
                )}
              >
                {categoryNames[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Синхронизация...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[2rem] bg-card/50 py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Ничего не найдено</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <EditableProductCard 
                key={item.id} 
                item={item} 
                onEdit={(item) => setEditingItem(item)} 
                onDelete={handleDeleteItem} 
              />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-28 right-6 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="rounded-full h-14 px-6 shadow-2xl bg-primary hover:bg-primary/90 text-white font-black flex items-center gap-3 transition-transform active:scale-95 border-2 border-white/10"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span className="text-xs uppercase tracking-[0.2em]">Добавить</span>
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none bg-background">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">НОВАЯ ПОЗИЦИЯ</DialogTitle>
          </DialogHeader>
          <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto no-scrollbar">
            <AddProductForm onSave={handleAddItem} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none bg-background">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">ИЗМЕНЕНИЕ ТОВАРА</DialogTitle>
          </DialogHeader>
          <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto no-scrollbar">
            {editingItem && (
              <AddProductForm 
                onSave={handleUpdateItem} 
                initialData={editingItem} 
                buttonLabel="Обновить товар" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
