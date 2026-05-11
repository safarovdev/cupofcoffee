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
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

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

  const handleDeleteItem = (id: string) => {
    if (!firestore || !id) return;
    
    // Не блокируем поток выполнения через await
    deleteDoc(doc(firestore, 'menu', id))
      .then(() => {
        toast({ title: 'Товар удален' });
      })
      .catch((error) => {
        console.error("Delete error:", error);
        toast({ 
          variant: 'destructive', 
          title: 'Ошибка удаления', 
          description: 'Проверьте права доступа или соединение'
        });
      });
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

  const handleBack = () => {
    setIsNavigatingBack(true);
    router.push('/admin');
  };

  const categoryNames: Record<string, string> = {
    'Все': 'Все', 'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
    'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
    'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="bg-card/80 backdrop-blur-md border-b p-4 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            disabled={isNavigatingBack}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
          >
            {isNavigatingBack ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <h1 className="font-black text-lg uppercase tracking-tight">СКЛАД</h1>
        </div>
        <Badge variant="secondary" className="rounded-full h-7 px-3 font-black bg-primary/10 text-primary border-none text-[10px]">
          {menuItems.length} ПОЗ.
        </Badge>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl bg-card border-none px-11 shadow-sm font-bold text-sm"
            />
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat 
                    ? "bg-primary text-white shadow-sm" 
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {categoryNames[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary w-8 h-8 opacity-20" />
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">Загрузка склада...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-none shadow-none rounded-2xl bg-card/50 py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground/10 mx-auto mb-3" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ничего не найдено</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

      <div className="fixed bottom-24 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="rounded-full h-12 px-5 shadow-xl bg-primary hover:bg-primary/90 text-white font-black flex items-center gap-2 active:scale-95 border-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="text-[10px] uppercase tracking-widest">Добавить</span>
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden border-none bg-background">
          <DialogHeader className="p-6 bg-primary text-white">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Новая позиция</DialogTitle>
          </DialogHeader>
          <div className="p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
            <AddProductForm onSave={handleAddItem} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden border-none bg-background">
          <DialogHeader className="p-6 bg-primary text-white">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Изменение товара</DialogTitle>
          </DialogHeader>
          <div className="p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
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
