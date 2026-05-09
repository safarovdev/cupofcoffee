'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddProductFormProps {
  onAdd: (data: any) => void;
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

const SIZE_OPTIONS = [
  'S', 'M', 'L', 'XL', '0.3л', '0.5л', '1л', 'Маленький', 'Большой', 'Стандартный'
];

export function AddProductForm({ onAdd }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    sizes: ''
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      return;
    }

    const productData = {
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      category: formData.category,
      ingredients: [],
      sizes: parseSizes(formData.sizes)
    };

    onAdd(productData);
    
    // Сброс формы
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      sizes: ''
    });
    setSelectedSizes([]);
  };

  const parseSizes = (sizesString: string): { [key: string]: number } => {
    if (!sizesString) return {};
    
    const sizes: { [key: string]: number } = {};
    sizesString.split(',').forEach(size => {
      const [name, price] = size.trim().split(':');
      if (name && price) {
        sizes[name.trim()] = Number(price.trim());
      }
    });
    return sizes;
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => {
      const newSizes = prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size];
      
      // Обновляем строку размеров
      const newSizesString = newSizes.map(s => {
        const currentSizes = parseSizes(formData.sizes);
        return `${s}:${currentSizes[s] || 0}`;
      }).join(', ');
      
      setFormData(prev => ({ ...prev, sizes: newSizesString }));
      return newSizes;
    });
  };

  const updateSizePrice = (size: string, price: string) => {
    const currentSizes = parseSizes(formData.sizes);
    currentSizes[size] = Number(price);
    
    const newSizesString = selectedSizes.map(s => `${s}:${currentSizes[s] || 0}`).join(', ');
    setFormData(prev => ({ ...prev, sizes: newSizesString }));
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border shadow-lg bg-card">
      <h3 className="text-lg font-bold mb-6">Добавить новый товар</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Название</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Название товара"
              required
              className="rounded-xl h-11 bg-muted/50 border-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Цена (сум)</Label>
              <Input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                required
                className="rounded-xl h-11 bg-muted/50 border-none"
              />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Категория</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} required>
                <SelectTrigger className="rounded-xl h-11 bg-muted/50 border-none">
                  <SelectValue placeholder="Выберите категорию" />
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
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Описание</Label>
            <Input 
              value={formData.description} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание товара"
              className="rounded-xl h-11 bg-muted/50 border-none"
            />
          </div>

          <div>
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Размеры (опционально)</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {SIZE_OPTIONS.map(size => (
                  <Button
                    key={size}
                    type="button"
                    size="sm"
                    variant={selectedSizes.includes(size) ? "default" : "outline"}
                    onClick={() => toggleSize(size)}
                    className="h-7 px-2 text-xs"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              {selectedSizes.length > 0 && (
                <div className="space-y-1">
                  {selectedSizes.map(size => (
                    <div key={size} className="flex items-center gap-2">
                      <Label className="text-xs w-16">{size}:</Label>
                      <Input 
                        type="number"
                        placeholder="Цена"
                        value={parseSizes(formData.sizes)[size] || ''}
                        onChange={(e) => updateSizePrice(size, e.target.value)}
                        className="rounded-lg h-7 bg-muted/50 border-none text-xs flex-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-xl h-12 font-bold gap-2 shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4" /> Создать товар
        </Button>
      </form>
    </div>
  );
}
