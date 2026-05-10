'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save } from 'lucide-react';

interface ProductFormProps {
  onSave: (data: any) => void;
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
    ingredients: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || '',
        ingredients: initialData.ingredients ? initialData.ingredients.join(', ') : ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      return;
    }

    const productData = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
    };

    onSave(productData);
    
    if (!initialData) {
      setFormData({
        name: '',
        price: '',
        category: '',
        ingredients: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Название</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название товара"
            required
            className="rounded-xl h-11 bg-muted/50 border-none font-bold"
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
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Категория</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} required>
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
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Ингредиенты (через запятую)</Label>
          <Input 
            value={formData.ingredients} 
            onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
            className="rounded-xl h-11 bg-muted/50 border-none font-bold"
            placeholder="Кофе, Молоко, Сахар"
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-xl h-12 font-black gap-2 shadow-lg uppercase text-xs tracking-widest">
        {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {buttonLabel || (initialData ? 'Сохранить изменения' : 'Создать товар')}
      </Button>
    </form>
  );
}
