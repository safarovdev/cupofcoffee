"use client";

import Image from "next/image";
import { Plus, Info } from "lucide-react";
import { MenuItem } from "./Menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomizationModal } from "./CustomizationModal";
import { useState } from "react";

interface ProductCardProps {
  item: MenuItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl flex flex-col h-full">
        {/* Image Container */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint="food item"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-md border-none text-primary font-bold px-3 py-1 shadow-sm">
              {item.price} ₽
            </Badge>
          </div>
          {item.allergens.length > 0 && (
            <div className="absolute top-4 left-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-2 bg-destructive/10 backdrop-blur-md rounded-full text-destructive cursor-help">
                      <Info className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive text-destructive-foreground border-none">
                    <p className="font-bold text-xs">Содержит: {item.allergens.join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-headline font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{item.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
          </div>

          <div className="flex flex-wrap gap-1 mt-auto">
            {item.ingredients.slice(0, 2).map((ing) => (
              <span key={ing} className="text-[10px] bg-secondary px-2 py-1 rounded text-muted-foreground font-bold">
                {ing}
              </span>
            ))}
          </div>

          <Button 
            className="w-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-2xl py-5 gap-2 font-bold text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Выбрать</span>
          </Button>
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