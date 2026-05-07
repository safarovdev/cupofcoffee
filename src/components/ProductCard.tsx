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
      <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint="food item"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border-none text-primary font-bold px-3 py-1">
              ${item.price.toFixed(2)}
            </Badge>
          </div>
          {item.allergens.length > 0 && (
            <div className="absolute top-4 left-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-2 bg-destructive/80 backdrop-blur-md rounded-full text-destructive-foreground cursor-help shadow-lg">
                      <Info className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive text-destructive-foreground border-none">
                    <p className="font-bold text-xs">Contains: {item.allergens.join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-headline font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
          </div>

          <div className="flex flex-wrap gap-1 mt-auto">
            {item.ingredients.slice(0, 3).map((ing) => (
              <Badge key={ing} variant="outline" className="text-[10px] uppercase font-bold tracking-tighter opacity-70">
                {ing}
              </Badge>
            ))}
            {item.ingredients.length > 3 && (
              <span className="text-[10px] text-muted-foreground ml-1">+{item.ingredients.length - 3} more</span>
            )}
          </div>

          <Button 
            className="w-full mt-4 bg-secondary hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 rounded-xl py-6 gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Customize & Order</span>
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