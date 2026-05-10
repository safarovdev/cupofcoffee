'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ShieldAlert, Plus, Trash2, Loader2, Package, Search, Edit } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AddProductForm } from '@/components/AddProductForm';

const CATEGORIES = ['Все']; // Будет заполнено из базы данных

export default function AdminProductsPage() {
  const { toast } = useToast();
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [categories, setCategories] = useState<string[]>(['Все']);

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
        
        // Извлекаем уникальные категории из товаров
        const uniqueCategories = ['Все', ...new Set(items.map((item: any) => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setMenuItems(items);
        console.log(`Products: Loaded ${items.length} items, categories: ${uniqueCategories.join(', ')}`);
      } catch (error) {
        console.error('Products: Error loading items:', error);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Удалить этот товар?')) return;
    
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
      
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Удалено', description: 'Товар успешно удален.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось удалить товар.' });
    }
  };

  const handleAddItem = async (data: any) => {
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
      setShowAddDialog(false);
      toast({ title: 'Добавлено', description: 'Новый товар успешно создан.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось создать товар.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b p-3 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-muted-foreground hover:text-primary p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-lg uppercase tracking-tight">Товары</h1>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {menuItems.length} позиций
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 pb-40">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap h-10 px-4 text-sm rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {menuLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary w-16 h-16" />
            <p className="mt-4 text-xl text-muted-foreground">Загрузка...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-24 h-24 text-muted-foreground/30 mb-4" />
            <p className="text-2xl text-muted-foreground">Нет товаров</p>
            <p className="text-muted-foreground/70 mt-2 text-lg">Добавьте первый товар</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                {/* Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Package className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                  <p className="font-bold text-primary mt-3 text-base">{item.price} ₽</p>
                  
                  {/* Always visible buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-10 text-sm"
                      onClick={() => {/* Edit logic */}}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-10 px-3"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-36 right-6 z-[999] lg:bottom-16">
        <Button 
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="rounded-full h-20 px-8 shadow-2xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-3 text-lg"
        >
          <Plus className="w-8 h-8" />
          <span>Добавить</span>
        </Button>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Добавить товар</DialogTitle>
          </DialogHeader>
          <AddProductForm onAdd={handleAddItem} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
