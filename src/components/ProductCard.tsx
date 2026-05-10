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
    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-primary/10 transition-transform group-hover:scale-105 duration-700">
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
    
    const isDrink = ['coffee', 'tea', 'ice-coffee', 'ice-tea'].includes(item.category);
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
        className="group relative flex flex-col gap-3 bg-white p-2.5 rounded-[2rem] border border-black/[0.03] shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer select-none active:scale-[0.98]"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-muted/20">
          <ItemPlaceholder category={item.category} />
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-2.5 right-2.5 bg-primary text-white p-2.5 rounded-xl shadow-xl hover:scale-110 transition-all active:scale-90 z-10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-black/[0.03]">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-black tracking-tight">{item.rating || 5.0}</span>
          </div>
        </div>

        <div className="px-1.5 pb-1.5 space-y-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-primary leading-tight line-clamp-1 group-hover:translate-x-0.5 transition-transform duration-300">
              {item.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-tight">
                <Clock className="w-2.5 h-2.5" />
                <span>{item.time || '5 мин'}</span>
              </p>
              <div className="w-0.5 h-0.5 rounded-full bg-primary/20" />
              <p className="text-[9px] text-primary/30 font-black uppercase tracking-widest">{item.category}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-black/[0.02]">
             <span className="text-base font-black text-primary tracking-tighter leading-none">
               {item.price.toLocaleString()} <span className="text-[8px] uppercase font-bold text-primary/40">сум</span>
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
