'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Staff {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: any;
}

export default function StaffPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: ''
  });

  const loadStaff = async () => {
    console.log('Loading staff from Firebase...');
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } = await import('firebase/firestore');
      
      const config = {
        apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
        authDomain: "coffee-f4bc1.firebaseapp.com",
        projectId: "coffee-f4bc1",
        storageBucket: "coffee-f4bc1.firebasestorage.app",
        messagingSenderId: "847730890494",
        appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
        measurementId: "G-3XN7LXDTJJ"
      };
      
      console.log('Initializing Firebase for staff loading...');
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const firestore = getFirestore(app);

      console.log('Getting staff collection...');
      const staffSnapshot = await getDocs(collection(firestore, 'staff'));
      console.log('Staff snapshot received, docs count:', staffSnapshot.docs.length);
      
      const staffData = staffSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Staff document data:', data);
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt
        } as Staff;
      });
      
      console.log('Staff data loaded:', staffData.length, 'employees');
      console.log('Staff details:', staffData);
      
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      console.error('Error details:', error.message);
      toast({ variant: 'destructive', title: 'Ошибка', description: `Не удалось загрузить персонал: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Adding staff:', formData);
    
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Имя и должность обязательны' });
      return;
    }
    
    const newStaff = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      isActive: true,
      createdAt: new Date()
    };

    try {
      console.log('Starting staff addition process...');
      console.log('Staff data to save:', newStaff);
      
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      
      const config = {
        apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
        authDomain: "coffee-f4bc1.firebaseapp.com",
        projectId: "coffee-f4bc1",
        storageBucket: "coffee-f4bc1.firebasestorage.app",
        messagingSenderId: "847730890494",
        appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
        measurementId: "G-3XN7LXDTJJ"
      };
      
      console.log('Initializing Firebase app...');
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      const firestore = getFirestore(app);
      console.log('Firebase initialized, getting staff collection...');

      console.log('Adding document to staff collection...');
      const docRef = await addDoc(collection(firestore, 'staff'), newStaff);
      console.log('Staff added with ID:', docRef.id);
      console.log('Document path:', docRef.path);

      toast({ title: 'Сотрудник добавлен', description: `${newStaff.name} добавлен в систему` });
      setShowAddForm(false);
      setFormData({ name: '', role: '' });
      
      // Перезагружаем список персонала
      loadStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      toast({ variant: 'destructive', title: 'Ошибка', description: `Не удалось добавить сотрудника: ${error.message}` });
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    
    console.log('Editing staff:', editingStaff);
    
    if (!editingStaff.name.trim() || !editingStaff.role.trim()) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Имя и должность обязательны' });
      return;
    }
    
    const updatedStaff = {
      ...editingStaff,
      name: editingStaff.name.trim(),
      role: editingStaff.role.trim(),
    };

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      
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

      await updateDoc(doc(firestore, 'staff', editingStaff.id), updatedStaff);

      setStaff(prev => prev.map(s => 
        s.id === editingStaff.id ? updatedStaff : s
      ));

      toast({ title: 'Сотрудник обновлен', description: `${updatedStaff.name} обновлен` });
      setEditingStaff(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обновить сотрудника' });
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return;
    }

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

      await deleteDoc(doc(firestore, 'staff', staffId));

      setStaff(prev => prev.filter(s => s.id !== staffId));

      toast({ title: 'Сотрудник удален', description: 'Сотрудник удален из системы' });
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось удалить сотрудника' });
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      
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

      await updateDoc(doc(firestore, 'staff', staffId), {
        isActive: !currentStatus
      });

      setStaff(prev => prev.map(s => 
        s.id === staffId ? { ...s, isActive: !currentStatus } : s
      ));

      toast({ title: 'Статус изменен', description: `Статус сотрудника изменен` });
    } catch (error) {
      console.error('Error toggling staff status:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось изменить статус' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-slate-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в админку
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
            Управление персоналом
          </h1>
          <p className="text-slate-600">Добавляйте и управляйте сотрудниками вашего кафе</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма добавления */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  {editingStaff ? 'Редактировать' : 'Добавить'} сотрудника
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {editingStaff ? 'Измените данные сотрудника' : 'Заполните данные для добавления нового сотрудника'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={editingStaff ? handleEditStaff : handleAddStaff} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">Имя *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={editingStaff ? editingStaff.name : formData.name}
                      onChange={(e) => editingStaff 
                        ? setEditingStaff({...editingStaff, name: e.target.value})
                        : setFormData({...formData, name: e.target.value})
                      }
                      placeholder="Введите имя сотрудника"
                      required
                      className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-slate-700">Должность *</Label>
                    <Input
                      id="role"
                      type="text"
                      value={editingStaff ? editingStaff.role : formData.role}
                      onChange={(e) => editingStaff 
                        ? setEditingStaff({...editingStaff, role: e.target.value})
                        : setFormData({...formData, role: e.target.value})
                      }
                      placeholder="Официант, Бариста, Менеджер"
                      required
                      className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 rounded-xl font-medium shadow-sm hover:shadow-md transition-shadow"
                    >
                      {editingStaff ? 'Обновить' : 'Добавить'}
                    </Button>
                    {editingStaff && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingStaff(null);
                          setFormData({ name: '', role: '' });
                        }}
                        className="h-11 px-6 rounded-xl border-slate-200 hover:bg-slate-50"
                      >
                        Отмена
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Список сотрудников */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Список сотрудников</CardTitle>
                  <div className="text-sm text-slate-600">
                    {staff.length} {staff.length === 1 ? 'сотрудник' : staff.length < 5 ? 'сотрудника' : 'сотрудников'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {staff.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Нет сотрудников</h3>
                    <p className="text-slate-600">Добавьте первого сотрудника, чтобы начать управление персоналом</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {staff.map((staffMember) => (
                      <div key={staffMember.id} className="p-4 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 text-lg">{staffMember.name}</h4>
                              <p className="text-slate-600">{staffMember.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={staffMember.isActive ? "default" : "secondary"}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                staffMember.isActive 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {staffMember.isActive ? 'Активен' : 'Неактивен'}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingStaff(staffMember)}
                                className="h-8 w-8 p-0 rounded-lg border-slate-200"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleStatus(staffMember.id, staffMember.isActive)}
                                className="h-8 px-3 rounded-lg border-slate-200 text-xs"
                              >
                                {staffMember.isActive ? 'Деакт.' : 'Акт.'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteStaff(staffMember.id)}
                                className="h-8 w-8 p-0 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
