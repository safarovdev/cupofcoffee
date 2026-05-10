
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Loader2, Flame, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

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

const IMGBB_API_KEY = '6e681c9c15fe63d6b40db8afc9230a41';

export function AddProductForm({ onSave, initialData, buttonLabel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    ingredients: '',
    isSpecial: false,
    imageUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || '',
        ingredients: initialData.ingredients ? initialData.ingredients.join(', ') : '',
        isSpecial: initialData.isSpecial || false,
        imageUrl: initialData.imageUrl || ''
      });
    }
  }, [initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: body
      });
      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, imageUrl: result.data.url }));
      }
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || isSaving || isUploading) return;

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        isSpecial: formData.isSpecial,
        imageUrl: formData.imageUrl
      };

      await onSave(productData);
      
      if (!initialData) {
        setFormData({ name: '', price: '', category: '', ingredients: '', isSpecial: false, imageUrl: '' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Блок загрузки изображения */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Изображение товара</Label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-[1.5rem] p-4 bg-muted/10">
            {formData.imageUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-background">
                <Image 
                  src={formData.imageUrl} 
                  alt="Превью" 
                  fill 
                  className="object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={removeImage}
                  disabled={isSaving || isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity py-4"
              >
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  {isUploading ? 'Загрузка...' : 'Нажмите для выбора фото'}
                </p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Название</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название товара"
            required
            className="rounded-xl h-11 bg-muted/50 border-none font-bold"
            disabled={isSaving || isUploading}
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
              disabled={isSaving || isUploading}
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Категория</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} 
              required
              disabled={isSaving || isUploading}
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
            disabled={isSaving || isUploading}
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
            disabled={isSaving || isUploading}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSaving || isUploading} className="w-full rounded-xl h-12 font-black gap-2 shadow-lg uppercase text-xs tracking-widest">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
        {isSaving ? 'СОХРАНЕНИЕ...' : (buttonLabel || (initialData ? 'Сохранить изменения' : 'Создать товар'))}
      </Button>
    </form>
  );
}
