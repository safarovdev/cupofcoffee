
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Loader2, Flame, Image as ImageIcon, X, Upload, Trash2, Layers, AlignLeft } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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

interface SizeEntry {
  label: string;
  price: string;
}

export function AddProductForm({ onSave, initialData, buttonLabel }: ProductFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: '',
    isSpecial: false,
    imageUrl: ''
  });
  
  const [sizes, setSizes] = useState<SizeEntry[]>([]);
  const [useSizes, setUseSizes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || '',
        ingredients: initialData.ingredients ? initialData.ingredients.join(', ') : '',
        isSpecial: initialData.isSpecial || false,
        imageUrl: initialData.imageUrl || ''
      });

      if (initialData.sizes && Object.keys(initialData.sizes).length > 0) {
        const initialSizes = Object.entries(initialData.sizes).map(([label, price]) => ({
          label,
          price: price?.toString() || ''
        }));
        setSizes(initialSizes);
        setUseSizes(true);
      }
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
        toast({ title: 'Изображение загружено' });
      } else {
        toast({ variant: 'destructive', title: 'Ошибка загрузки', description: result.error?.message || 'Попробуйте другое фото' });
      }
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      toast({ variant: 'destructive', title: 'Ошибка загрузки', description: 'Не удалось загрузить фото на сервер' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSize = () => {
    setSizes([...sizes, { label: '', price: '' }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof SizeEntry, value: string) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSaving || isUploading) return;

    const name = formData.name.trim();
    const category = formData.category;

    if (!name) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Введите название товара' });
      return;
    }
    
    if (!category) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Выберите категорию' });
      return;
    }

    let finalPrice = Number(formData.price);
    let finalSizes: Record<string, number> | null = null;

    if (useSizes) {
      if (sizes.length === 0) {
        toast({ variant: 'destructive', title: 'Ошибка', description: 'Добавьте хотя бы один размер или отключите выбор размеров' });
        return;
      }
      
      finalSizes = {};
      let hasIncomplete = false;
      
      sizes.forEach(s => {
        if (!s.label.trim() || !s.price) {
          hasIncomplete = true;
        } else {
          finalSizes![s.label.trim()] = Number(s.price);
        }
      });

      if (hasIncomplete) {
        toast({ variant: 'destructive', title: 'Ошибка', description: 'Заполните все поля размеров или удалите лишние' });
        return;
      }

      const firstPrice = Object.values(finalSizes)[0];
      finalPrice = firstPrice;
    } else {
      if (!formData.price || isNaN(finalPrice) || finalPrice <= 0) {
        toast({ variant: 'destructive', title: 'Ошибка', description: 'Введите корректную цену' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const productData = {
        name: name,
        description: formData.description.trim(),
        price: finalPrice,
        category: category,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        isSpecial: formData.isSpecial,
        imageUrl: formData.imageUrl,
        sizes: useSizes ? finalSizes : null
      };

      await onSave(productData);
      
      if (!initialData) {
        setFormData({ name: '', description: '', price: '', category: '', ingredients: '', isSpecial: false, imageUrl: '' });
        setSizes([]);
        setUseSizes(false);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message || 'Не удалось сохранить товар' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Фото товара</Label>
          <div 
            onClick={() => !isUploading && !isSaving && fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-[2rem] min-h-[160px] bg-muted/5 cursor-pointer hover:bg-muted/10 transition-all overflow-hidden"
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
                      disabled={isSaving}
                      className="rounded-full bg-white text-black hover:bg-white/90 font-bold h-8 px-3 text-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-3 h-3 mr-2" /> Сменить
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      disabled={isSaving}
                      className="h-8 w-8 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <div className="bg-primary/5 p-3 rounded-2xl text-primary transition-transform group-hover:scale-110">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {isUploading ? 'Загрузка...' : 'Добавить фото'}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Название</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Напр. Капучино"
              required
              className="rounded-xl h-11 bg-muted/50 border-none font-bold text-sm"
              disabled={isSaving || isUploading}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Категория</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} 
              required
              disabled={isSaving || isUploading}
            >
              <SelectTrigger className="rounded-xl h-11 bg-muted/50 border-none font-bold text-sm">
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

        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50 flex items-center gap-2">
            <AlignLeft className="w-3 h-3" /> Описание
          </Label>
          <Textarea 
            value={formData.description} 
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="rounded-xl bg-muted/50 border-none font-bold text-sm min-h-[80px]"
            placeholder="Опишите вкус, аромат или способ подачи..."
            disabled={isSaving || isUploading}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Ингредиенты</Label>
          <Input 
            value={formData.ingredients} 
            onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
            className="rounded-xl h-11 bg-muted/50 border-none font-bold text-sm"
            placeholder="Кофе, Молоко, Сахар..."
            disabled={isSaving || isUploading}
          />
        </div>

        <div className="space-y-4 bg-muted/20 p-4 rounded-[2rem] border border-muted-foreground/5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary opacity-40" />
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Размеры и цены</Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Несколько размеров?</span>
              <Switch 
                checked={useSizes} 
                onCheckedChange={setUseSizes} 
                disabled={isSaving || isUploading}
              />
            </div>
          </div>

          {!useSizes ? (
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-40">Базовая цена (сум)</Label>
              <Input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                className="rounded-xl h-11 bg-background border-none font-bold text-sm"
                disabled={isSaving || isUploading}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {sizes.map((size, index) => (
                <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                  <Input 
                    placeholder="Напр. 0.3л" 
                    value={size.label}
                    onChange={(e) => updateSize(index, 'label', e.target.value)}
                    className="flex-1 rounded-xl h-10 bg-background border-none font-bold text-xs"
                    disabled={isSaving}
                  />
                  <Input 
                    type="number"
                    placeholder="Цена" 
                    value={size.price}
                    onChange={(e) => updateSize(index, 'price', e.target.value)}
                    className="w-24 sm:w-32 rounded-xl h-10 bg-background border-none font-bold text-xs"
                    disabled={isSaving}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeSize(index)}
                    className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={addSize}
                className="w-full h-10 rounded-xl border-dashed border-2 hover:bg-background/50 font-bold text-[10px] uppercase tracking-widest gap-2"
                disabled={isSaving}
              >
                <Plus className="w-3 h-3" /> Добавить размер
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-200">
              <Flame className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tight text-orange-900 leading-none mb-1">Спецпредложение</p>
              <p className="text-[8px] font-bold text-orange-700/60 uppercase">Будет на главном баннере</p>
            </div>
          </div>
          <Switch 
            checked={formData.isSpecial} 
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSpecial: checked }))} 
            disabled={isSaving || isUploading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSaving || isUploading} 
        className="w-full rounded-2xl h-14 font-black gap-2 shadow-xl uppercase text-xs tracking-widest mt-2"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
        )}
        {isSaving ? 'СОХРАНЕНИЕ...' : (buttonLabel || (initialData ? 'Сохранить изменения' : 'Создать товар'))}
      </Button>
    </form>
  );
}
