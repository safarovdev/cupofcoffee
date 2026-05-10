
"use client";

import { Star, Clock, Plus, Coffee, Wine, IceCream, Cookie, Beaker } from "lucide-react";
import { MenuItem } from "./Menu";
import { CustomizationModal } from "./CustomizationModal";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  item: MenuItem;
}

function ItemPlaceholder({ category }: { category: string }) {
  const getIcon = () => {
    switch (category) {
      case 'coffee': return <Coffee className="w-10 h-10" />;
      case 'ice-coffee': return <Coffee className="w-10 h-10" />;
      case 'mojito': return <Wine className="w-10 h-10" />;
      case 'mojito-carafe': return <Beaker className="w-10 h-10" />;
      case 'tea': return <Coffee className="w-10 h-10 rotate-12" />;
      case 'ice-tea': return <Wine className="w-10 h-10" />;
      case 'milkshakes': return <Wine className="w-10 h-10" />;
      case 'ice-cream': return <IceCream className="w-10 h-10" />;
      default: return <Cookie className="w-10 h-10" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-primary/20">
      {getIcon()}
    </div>
  );
}

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.sizes) {
      setIsModalOpen(true);
      return;
    }
    
    const isDrink = item.category === "coffee" || item.category === "tea" || item.category === "ice-coffee";
    addToCart(item, undefined, isDrink ? "regular" : undefined);
    toast({
      title: "Добавлено!",
      description: `${item.name} в корзине.`,
    });
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1rem] bg-muted shadow-inner">
          <ItemPlaceholder category={item.category} />
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg text-primary hover:scale-110 transition-transform active:scale-90"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="px-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground leading-tight truncate">
              {item.name}
            </h3>
            <span className="text-sm font-bold whitespace-nowrap text-primary">
              {item.sizes ? `от ${item.price}` : item.price} сум
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-primary" />
              <span className="text-foreground">{item.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{item.time}</span>
            </div>
          </div>
          {item.sizes && (
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest pt-1">
              Доступны разные объемы
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
