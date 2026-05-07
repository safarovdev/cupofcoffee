"use client";

import Image from "next/image";
import { Star, Clock, Plus } from "lucide-react";
import { MenuItem } from "./Menu";
import { Badge } from "@/components/ui/badge";
import { CustomizationModal } from "./CustomizationModal";
import { useState } from "react";

interface ProductCardProps {
  item: MenuItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            data-ai-hint="coffee or dessert"
          />
          
          {item.discount && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-destructive text-white border-none font-bold px-2 py-1 rounded-lg">
                -{item.discount}%
              </Badge>
            </div>
          )}
          
          <button className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg text-primary hover:scale-110 transition-transform active:scale-90">
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Content Info */}
        <div className="px-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-foreground leading-tight truncate">
              {item.name}
            </h3>
            <span className="text-base font-bold whitespace-nowrap">
              {item.price} ₽
            </span>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current text-primary" />
              <span className="text-foreground">{item.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{item.time}</span>
            </div>
          </div>
          
          {item.discount && (
            <div className="mt-1">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] font-bold py-0 h-5">
                Бесплатная доставка
              </Badge>
            </div>
          )}
        </div>
      </div>

      <CustomizationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        item={item} 
      />
    </>
  );
}