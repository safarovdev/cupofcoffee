
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Coffee, Flame, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EditableProductCardProps {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export function EditableProductCard({ item, onEdit, onDelete }: EditableProductCardProps) {
  const categoryNames: Record<string, string> = {
    'coffee': 'Кофе', 'tea': 'Чай', 'mojito': 'Мохито',
    'mojito-carafe': 'Графины', 'milkshakes': 'Шейки',
    'ice-cream': 'Мороженое', 'desserts': 'Десерты', 'bakery': 'Выпечка'
  };

  const hasSizes = item.sizes && Object.keys(item.sizes).length > 0;
  const sizeCount = hasSizes ? Object.keys(item.sizes).length : 0;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("EditableCard: Edit requested for ID:", item.id);
    onEdit(item);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const docId = item.id;
    console.log("EditableCard: Delete button clicked for ID:", docId);

    if (!docId) {
      console.error("EditableCard: ID IS MISSING IN ITEM DATA!", item);
      alert("Ошибка: ID товара не найден в данных");
      return;
    }

    if (window.confirm(`Вы уверены, что хотите полностью удалить товар "${item.name}"?`)) {
      console.log("EditableCard: Confirmed. Calling onDelete for:", docId);
      onDelete(docId);
    }
  };

  return (
    <Card className={cn(
      "group overflow-hidden rounded-[2rem] border-none shadow-sm transition-all bg-card relative",
      item.isSpecial && "bg-orange-50/40 border border-orange-100/50"
    )}>
      <CardContent className="p-0 flex h-32 relative">
        {/* Фото */}
        <div className="w-32 bg-muted relative flex items-center justify-center shrink-0 overflow-hidden">
          {item.imageUrl ? (
            <Image 
              src={item.imageUrl} 
              alt={item.name} 
              fill 
              className="object-cover"
            />
          ) : (
            <Coffee className="w-8 h-8 text-primary/10" />
          )}
          <Badge className="absolute top-2 left-2 text-[7px] font-black bg-white/90 text-primary border-none shadow-sm px-2 py-0.5 rounded-lg uppercase tracking-widest">
            {categoryNames[item.category] || item.category}
          </Badge>
          {item.isSpecial && (
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white p-1.5 rounded-xl shadow-lg shadow-orange-200">
              <Flame className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Инфо и Кнопки */}
        <div className="flex-1 p-4 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <div className="max-w-[140px] sm:max-w-[180px]">
              <h3 className="font-black text-[14px] uppercase tracking-tight leading-none line-clamp-1">{item.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1 opacity-60 font-medium">
                {item.ingredients?.length > 0 ? item.ingredients.join(', ') : 'Без состава'}
              </p>
              
              {hasSizes && (
                <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-primary/40 uppercase tracking-widest">
                  <Layers className="w-3 h-3" />
                  Вариантов: {sizeCount}
                </div>
              )}
            </div>
            
            {/* Слой кнопок */}
            <div className="flex gap-1.5 relative z-[100] pointer-events-auto">
              <button 
                type="button"
                className="h-9 w-9 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" 
                onClick={handleEditClick}
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                type="button"
                className="h-9 w-9 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                onClick={handleDeleteClick}
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-end mt-auto">
            <div className="space-y-0.5">
              {hasSizes && <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest opacity-40">Начиная с</p>}
              <p className={cn(
                "text-lg font-black tracking-tighter leading-none",
                item.isSpecial ? "text-orange-600" : "text-primary"
              )}>
                {item.price?.toLocaleString() || 0} <span className="text-[9px] opacity-40">СУМ</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
