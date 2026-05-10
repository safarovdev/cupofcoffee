
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Loader2, Flame, Image as ImageIcon, X, Upload } from 'lucide-react';
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

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Фото товара</Label>
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-[2rem] min-h-[180px] bg-muted/5 cursor-pointer hover:bg-muted/10 transition-all overflow-hidden"
          >
            {formData.imageUrl ? (
              <div className="absolute inset-0 w-full h-full">
                <Image 
                  src={formData.imageUrl} 
                  alt="Превью" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full bg-white text-black hover:bg-white/90 font-bold"
                    >
                      <Upload className="w-3 h-3 mr-2" /> Сменить
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="bg-primary/5 p-4 rounded-2xl text-primary transition-transform group-hover:scale-110">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {isUploading ? 'Загрузка в облако...' : 'Нажмите для выбора'}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground/50 uppercase mt-1">PNG, JPG до 5MB</p>
                </div>
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
                <SelectValue placeholder="Выбрать" />
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
            placeholder="Кофе, Молоко, Сахар..."
            disabled={isSaving || isUploading}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 mt-2">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tight text-orange-900 leading-none mb-1">Спецпредложение</p>
              <p className="text-[8px] text-orange-700/60 font-bold uppercase leading-none">Главный баннер меню</p>
            </div>
          </div>
          <Switch 
            checked={formData.isSpecial} 
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSpecial: checked }))} 
            disabled={isSaving || isUploading}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSaving || isUploading} className="w-full rounded-2xl h-14 font-black gap-2 shadow-xl uppercase text-xs tracking-widest mt-4">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
        {isSaving ? 'СОХРАНЕНИЕ...' : (buttonLabel || (initialData ? 'Сохранить изменения' : 'Создать товар'))}
      </Button>
    </form>
  );
}
