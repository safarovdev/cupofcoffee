'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  return (
    <Card className="group overflow-hidden rounded-[2rem] border-none shadow-md bg-card transition-all active:scale-[0.98] hover:shadow-lg">
      <CardContent className="p-0 flex h-32">
        <div className="w-32 bg-muted relative flex items-center justify-center shrink-0">
          <Coffee className="w-8 h-8 text-primary/10" />
          <Badge className="absolute top-2 left-2 text-[8px] font-black bg-white/90 text-primary border-none">
            {categoryNames[item.category] || item.category}
          </Badge>
        </div>
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight leading-none line-clamp-1">{item.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.ingredients?.join(', ')}</p>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary" 
                onClick={() => onEdit(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-destructive/5 text-muted-foreground hover:text-destructive" 
                onClick={() => {
                  if (confirm('Удалить этот товар?')) {
                    onDelete(item.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-black text-primary tracking-tighter">{item.price.toLocaleString()} сум</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
