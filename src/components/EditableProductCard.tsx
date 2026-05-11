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
    onEdit(item);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Используем стандартный confirm, но с перехватом события
    if (window.confirm(`Удалить товар "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <Card className={cn(
      "group overflow-hidden rounded-2xl border-none shadow-sm transition-all active:scale-[0.99] hover:shadow-md",
      item.isSpecial ? "bg-orange-50/30" : "bg-card"
    )}>
      <CardContent className="p-0 flex h-28">
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
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="max-w-[140px]">
              <h3 className="font-black text-[13px] uppercase tracking-tight leading-none line-clamp-1">{item.name}</h3>
              <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1 opacity-60">
                {item.ingredients?.length > 0 ? item.ingredients.join(', ') : 'Без состава'}
              </p>
            </div>
            <div className="flex gap-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors" 
                onClick={handleEditClick}
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors" 
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className={cn(
              "text-base font-black tracking-tighter",
              item.isSpecial ? "text-orange-600" : "text-primary"
            )}>
              {item.price.toLocaleString()} <span className="text-[8px] opacity-40">СУМ</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
