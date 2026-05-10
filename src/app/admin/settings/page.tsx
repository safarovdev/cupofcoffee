'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Loader2, Package, Search, Coffee } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AddProductForm } from '@/components/AddProductForm';
import { cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const firestore = useFirestore();
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
      toast({ variant: 'destructive', title: 'Ошибка загрузки' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenuItems(); }, [firestore]);

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

  const categoryNames: Record<string, string> = {
    'Все': 'Все', 'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
    'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
    'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-black text-xl uppercase tracking-tighter">РЕДАКТОР <span className="text-primary">МЕНЮ</span></h1>
        </div>
        <Badge variant="secondary" className="rounded-full h-8 px-4 font-black bg-primary/10 text-primary border-none">
          {menuItems.length}
        </Badge>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Поиск и фильтры */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 rounded-[2rem] bg-card border-none px-14 shadow-sm font-bold text-lg"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat 
                    ? "bg-primary text-white shadow-lg scale-105" 
                    : "bg-card text-muted-foreground hover:bg-muted shadow-sm"
                )}
              >
                {categoryNames[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Список товаров */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">ЗАГРУЗКА...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-card/50 py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Ничего не найдено</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-md bg-card transition-all active:scale-[0.98]">
                <div className="aspect-[4/3] bg-muted relative flex items-center justify-center">
                  <Coffee className="w-12 h-12 text-primary/10" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="icon" variant="destructive" className="rounded-2xl h-10 w-10 shadow-lg" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-lg uppercase tracking-tighter leading-none line-clamp-1">{item.name}</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/20 text-primary/60">
                      {categoryNames[item.category] || item.category}
                    </Badge>
                    <p className="text-lg font-black text-primary tracking-tighter">{item.price} сум</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button 
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-28 right-6 rounded-[2.5rem] h-20 px-8 shadow-2xl font-black text-xl gap-3 z-[60] bg-primary text-white"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
        <span>ТОВАР</span>
      </Button>

      {/* Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none bg-background">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">НОВАЯ ПОЗИЦИЯ</DialogTitle>
          </DialogHeader>
          <div className="p-6 sm:p-10">
            <AddProductForm onAdd={handleAddItem} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
