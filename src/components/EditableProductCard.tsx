'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Coffee, Flame } from 'lucide-react';
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("EditableCard: Edit requested for ID:", item.id);
    onEdit(item);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    // Останавливаем любые события, чтобы клик не "провалился"
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
      "group overflow-hidden rounded-2xl border-none shadow-sm transition-all bg-card relative",
      item.isSpecial && "bg-orange-50/30 border border-orange-100/50"
    )}>
      <CardContent className="p-0 flex h-28 relative">
        {/* Фото */}
        <div className="w-28 bg-muted relative flex items-center justify-center shrink-0 overflow-hidden">
          {item.imageUrl ? (
            <Image 
              src={item.imageUrl} 
              alt={item.name} 
              fill 
              className="object-cover"
            />
          ) : (
            <Coffee className="w-6 h-6 text-primary/10" />
          )}
          <Badge className="absolute top-1.5 left-1.5 text-[7px] font-black bg-white/90 text-primary border-none shadow-sm px-1.5 py-0">
            {categoryNames[item.category] || item.category}
          </Badge>
          {item.isSpecial && (
            <div className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white p-1 rounded-md shadow-lg">
              <Flame className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Инфо и Кнопки */}
        <div className="flex-1 p-3 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <div className="max-w-[120px] sm:max-w-[160px]">
              <h3 className="font-black text-[13px] uppercase tracking-tight leading-none line-clamp-1">{item.name}</h3>
              <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1 opacity-60">
                {item.ingredients?.length > 0 ? item.ingredients.join(', ') : 'Без состава'}
              </p>
            </div>
            
            {/* Слой кнопок с высоким z-index */}
            <div className="flex gap-1 relative z-[100] pointer-events-auto">
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" 
                onClick={handleEditClick}
                title="Редактировать"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                onClick={handleDeleteClick}
                title="Удалить"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <p className={cn(
              "text-base font-black tracking-tighter",
              item.isSpecial ? "text-orange-600" : "text-primary"
            )}>
              {item.price?.toLocaleString() || 0} <span className="text-[8px] opacity-40">СУМ</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}