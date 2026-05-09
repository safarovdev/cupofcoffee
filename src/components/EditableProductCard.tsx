'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Save, X } from 'lucide-react';

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

const SIZE_OPTIONS = [
  'S', 'M', 'L', 'XL', '0.3л', '0.5л', '1л', 'Маленький', 'Большой', 'Стандартный'
];

export function EditableProductCard({ item, onUpdate, onDelete }: EditableProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    price: item.price,
    description: item.description,
    category: item.category,
    ingredients: item.ingredients ? item.ingredients.join(', ') : '',
    sizes: item.sizes ? Object.entries(item.sizes).map(([size, price]) => `${size}:${price}`).join(', ') : ''
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>(Object.keys(item.sizes || {}));

  const handleSave = () => {
    const updatedData = {
      ...editData,
      ingredients: editData.ingredients.split(',').map(i => i.trim()).filter(i => i),
      sizes: parseSizes(editData.sizes)
    };
    onUpdate(item.id, updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      ingredients: item.ingredients ? item.ingredients.join(', ') : '',
      sizes: item.sizes ? Object.entries(item.sizes).map(([size, price]) => `${size}:${price}`).join(', ') : ''
    });
    setSelectedSizes(Object.keys(item.sizes || {}));
    setIsEditing(false);
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
        const currentSizes = parseSizes(editData.sizes);
        return `${s}:${currentSizes[s] || 0}`;
      }).join(', ');
      
      setEditData(prev => ({ ...prev, sizes: newSizesString }));
      return newSizes;
    });
  };

  const updateSizePrice = (size: string, price: string) => {
    const currentSizes = parseSizes(editData.sizes);
    currentSizes[size] = Number(price);
    
    const newSizesString = selectedSizes.map(s => `${s}:${currentSizes[s] || 0}`).join(', ');
    setEditData(prev => ({ ...prev, sizes: newSizesString }));
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-2xl bg-card border-2 border-primary shadow-lg">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm">Редактирование товара</h4>
            <div className="flex gap-1">
              <Button size="sm" onClick={handleSave} className="h-8 px-3">
                <Save className="w-4 h-4 mr-1" /> Сохранить
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-3">
                <X className="w-4 h-4 mr-1" /> Отмена
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Название</Label>
              <Input 
                value={editData.name} 
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl h-9 bg-muted/50 border-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Цена (сум)</Label>
                <Input 
                  type="number" 
                  value={editData.price} 
                  onChange={(e) => setEditData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="rounded-xl h-9 bg-muted/50 border-none text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Категория</Label>
                <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="rounded-xl h-9 bg-muted/50 border-none text-sm">
                    <SelectValue />
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
                value={editData.description} 
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-xl h-9 bg-muted/50 border-none text-sm"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Размеры</Label>
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
                          value={parseSizes(editData.sizes)[size] || ''}
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border shadow-sm group hover:border-primary/20 transition-all">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-primary font-bold text-[10px] uppercase">
          {item.category.substring(0, 3)}
        </div>
        <div>
          <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
          <p className="text-xs font-bold text-primary">{item.price} сум</p>
          {item.sizes && Object.keys(item.sizes).length > 0 && (
            <p className="text-xs text-muted-foreground">
              Размеры: {Object.keys(item.sizes).join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary h-8 w-8" 
          onClick={() => setIsEditing(true)}
          title="Редактировать товар"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive h-8 w-8" 
          onClick={() => onDelete(item.id)}
          title="Удалить товар"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
