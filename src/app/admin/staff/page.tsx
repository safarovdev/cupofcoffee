'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Edit, Trash2, ArrowLeft, Loader2, Power } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Staff {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: any;
}

export default function StaffPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staffQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'staff');
  }, [firestore]);

  const { data: staff, loading } = useCollection<Staff>(staffQuery as any);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !formData.name.trim() || !formData.role.trim()) return;
    setIsSubmitting(true);

    try {
      if (editingStaff) {
        await updateDoc(doc(firestore, 'staff', editingStaff.id), {
          name: formData.name.trim(),
          role: formData.role.trim(),
        });
        toast({ title: 'Обновлено' });
      } else {
        await addDoc(collection(firestore, 'staff'), {
          name: formData.name.trim(),
          role: formData.role.trim(),
          isActive: true,
          createdAt: new Date()
        });
        toast({ title: 'Добавлен новый сотрудник' });
      }
      
      setFormData({ name: '', role: '' });
      setEditingStaff(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm('Удалить сотрудника?')) return;
    try {
      await deleteDoc(doc(firestore, 'staff', id));
      toast({ title: 'Удалено' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'staff', id), { isActive: !current });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
      <header className="bg-card/80 backdrop-blur-md border-b p-6 sticky top-0 z-50 flex items-center gap-4 px-6">
        <Link href="/admin" className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-black text-xl uppercase tracking-tighter">ШТАТ <span className="text-primary">СОТРУДНИКОВ</span></h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-6 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              {editingStaff ? 'РЕДАКТИРОВАНИЕ' : 'НОВЫЙ СОТРУДНИК'}
            </h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Добавьте профессионала в команду</p>
          </div>
          <form onSubmit={handleAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-50">Имя Фамилия</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-14 rounded-2xl bg-muted/50 border-none px-6 font-bold"
                  placeholder="Иван Иванов"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-50">Должность</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="h-14 rounded-2xl bg-muted/50 border-none px-6 font-bold"
                  placeholder="Официант / Бариста"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button disabled={isSubmitting} className="flex-1 h-16 rounded-2xl font-black text-lg shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingStaff ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
              </Button>
              {editingStaff && (
                <Button variant="ghost" className="h-16 px-6 rounded-2xl text-muted-foreground" onClick={() => { setEditingStaff(null); setFormData({ name: '', role: '' }); }}>
                  ОТМЕНА
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">ТЕКУЩИЙ СОСТАВ ({staff?.length || 0})</p>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
          ) : !staff || staff.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-[2.5rem] opacity-30">Никого нет</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staff.map((s) => (
                <Card key={s.id} className="border-none shadow-md rounded-[2rem] bg-card overflow-hidden transition-all active:scale-[0.98] animate-in slide-in-from-bottom-2 duration-300">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors",
                        s.isActive ? "bg-primary" : "bg-muted-foreground/30"
                      )}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight">{s.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{s.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10" onClick={() => toggleStatus(s.id, s.isActive)}>
                        <Power className={cn("w-4 h-4", s.isActive ? "text-emerald-500" : "text-muted-foreground")} />
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10" onClick={() => { setEditingStaff(s); setFormData({ name: s.name, role: s.role }); }}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}