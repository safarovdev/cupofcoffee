"use client";

import { Star, Clock, Plus, Coffee, Wine, IceCream, Cookie, Beaker } from "lucide-react";
import { MenuItem } from "./Menu";
import { CustomizationModal } from "./CustomizationModal";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  item: MenuItem;
}

function ItemPlaceholder({ category }: { category: string }) {
  const getIcon = () => {
    switch (category) {
      case 'coffee': return <Coffee className="w-12 h-12" />;
      case 'ice-coffee': return <Coffee className="w-12 h-12" />;
      case 'mojito': return <Wine className="w-12 h-12" />;
      case 'mojito-carafe': return <Beaker className="w-12 h-12" />;
      case 'tea': return <Coffee className="w-12 h-12 rotate-12" />;
      case 'ice-tea': return <Wine className="w-12 h-12" />;
      case 'milkshakes': return <Wine className="w-12 h-12" />;
      case 'ice-cream': return <IceCream className="w-12 h-12" />;
      default: return <Cookie className="w-12 h-12" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-accent/40 to-accent/10 flex items-center justify-center text-primary/10 transition-transform group-hover:scale-110 duration-500">
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
        className="group relative flex flex-col gap-4 bg-white p-3 rounded-[2rem] border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer select-none active:scale-[0.97]"
      >
        <div className="relative aspect-[1/1] w-full overflow-hidden rounded-[1.5rem] bg-muted">
          <ItemPlaceholder category={item.category} />
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 bg-primary text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-90 z-10"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>

          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-black">{item.rating || 5.0}</span>
          </div>
        </div>

        <div className="px-1.5 pb-2 space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{item.time || '5-10 мин'}</span>
              <span className="text-black/5">•</span>
              <span className="uppercase tracking-widest">{item.category}</span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5">
            <span className="text-lg font-black text-primary tracking-tighter">
              {item.sizes ? `от ${item.price}` : item.price} <span className="text-[10px] uppercase ml-0.5">сум</span>
            </span>
          </div>
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