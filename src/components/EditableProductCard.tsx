'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Save, X, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EditableProductCardProps {
  item: any;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  { value: 'coffee', label: 'Кофе' },
  { value: 'tea', label: 'Чай' },
  { value: 'mojito', label: 'Мохито' },
  { value: 'mojito-carafe', label: 'Мохито (Графин)' },
  { value: 'milkshakes', label: 'Милкшейки' },
  { value: 'ice-cream', label: 'Мороженое' },
  { value: 'desserts', label: 'Десерты' },
  { value: 'bakery', label: 'Выпечка' }
];

export function EditableProductCard({ item, onUpdate, onDelete }: EditableProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name || '',
    price: item.price || 0,
    description: item.description || '',
    category: item.category || 'coffee',
    ingredients: item.ingredients ? item.ingredients.join(', ') : '',
  });

  const handleSave = () => {
    const updatedData = {
      ...editData,
      ingredients: editData.ingredients.split(',').map(i => i.trim()).filter(i => i),
    };
    onUpdate(item.id, updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: item.name || '',
      price: item.price || 0,
      description: item.description || '',
      category: item.category || 'coffee',
      ingredients: item.ingredients ? item.ingredients.join(', ') : '',
    });
    setIsEditing(false);
  };

  const categoryNames: Record<string, string> = {
    'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
    'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
    'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
  };

  if (isEditing) {
    return (
      <Card className="rounded-[2rem] border-2 border-primary shadow-xl overflow-hidden bg-card animate-in fade-in zoom-in-95 duration-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Редактирование</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Название</Label>
              <Input 
                value={editData.name} 
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl h-11 bg-muted/50 border-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Цена (сум)</Label>
                <Input 
                  type="number" 
                  value={editData.price} 
                  onChange={(e) => setEditData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="rounded-xl h-11 bg-muted/50 border-none font-bold"
                />
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Категория</Label>
                <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/50 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Ингредиенты (через запятую)</Label>
              <Input 
                value={editData.ingredients} 
                onChange={(e) => setEditData(prev => ({ ...prev, ingredients: e.target.value }))}
                className="rounded-xl h-11 bg-muted/50 border-none font-bold"
                placeholder="Кофе, Молоко, Сахар"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full h-12 rounded-xl font-black gap-2 shadow-lg">
            <Save className="w-4 h-4" /> СОХРАНИТЬ
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden rounded-[2rem] border-none shadow-md bg-card transition-all active:scale-[0.98] hover:shadow-lg">
      <CardContent className="p-0 flex h-32">
        <div className="w-32 bg-muted relative flex items-center justify-center shrink-0">
          <Coffee className="w-8 h-8 text-primary/10" />
          <Badge className="absolute top-2 left-2 text-[8px] font-black bg-white/90 text-primary border-none">
            {categoryNames[item.category] || item.category}
          </Badge>
        </div>
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight leading-none line-clamp-1">{item.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.ingredients?.join(', ')}</p>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-destructive/5 text-muted-foreground hover:text-destructive" 
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-black text-primary tracking-tighter">{item.price.toLocaleString()} сум</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}