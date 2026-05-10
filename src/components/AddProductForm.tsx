
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Loader2, Flame } from 'lucide-react';

interface ProductFormProps {
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  buttonLabel?: string;
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

export function AddProductForm({ onSave, initialData, buttonLabel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    ingredients: '',
    isSpecial: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || '',
        ingredients: initialData.ingredients ? initialData.ingredients.join(', ') : '',
        isSpecial: initialData.isSpecial || false
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || isSaving) return;

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        isSpecial: formData.isSpecial
      };

      await onSave(productData);
      
      if (!initialData) {
        setFormData({ name: '', price: '', category: '', ingredients: '', isSpecial: false });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Название</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название товара"
            required
            className="rounded-xl h-11 bg-muted/50 border-none font-bold"
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Цена (сум)</Label>
            <Input 
              type="number" 
              value={formData.price} 
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0"
              required
              className="rounded-xl h-11 bg-muted/50 border-none font-bold"
              disabled={isSaving}
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Категория</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} 
              required
              disabled={isSaving}
            >
              <SelectTrigger className="rounded-xl h-11 bg-muted/50 border-none font-bold">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Ингредиенты</Label>
          <Input 
            value={formData.ingredients} 
            onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
            className="rounded-xl h-11 bg-muted/50 border-none font-bold"
            placeholder="Кофе, Молоко, Сахар"
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100 mt-2">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-orange-900 leading-none mb-1">Спецпредложение</p>
              <p className="text-[9px] text-orange-700/60 font-medium leading-none">Показать на главном баннере</p>
            </div>
          </div>
          <Switch 
            checked={formData.isSpecial} 
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSpecial: checked }))} 
            disabled={isSaving}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full rounded-xl h-12 font-black gap-2 shadow-lg uppercase text-xs tracking-widest">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
        {isSaving ? 'СОХРАНЕНИЕ...' : (buttonLabel || (initialData ? 'Сохранить изменения' : 'Создать товар'))}
      </Button>
    </form>
  );
}
