
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
    
    const isDrink = item.category === "coffee" || item.category === "tea" || item.category === "ice-coffee";
    addToCart(item, undefined, isDrink ? "regular" : undefined);
    toast({
      title: "Добавлено!",
      description: `${item.name} теперь в корзине.`,
    });
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col gap-4 bg-white p-3 rounded-[2.5rem] border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer select-none active:scale-[0.98]"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-muted/20">
          <ItemPlaceholder category={item.category} />
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 bg-primary text-white p-3 rounded-2xl shadow-2xl hover:scale-110 transition-all active:scale-90 z-10"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>

          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border border-black/[0.05]">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-black tracking-tight">{item.rating || 5.0}</span>
          </div>
        </div>

        <div className="px-2 pb-2 space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-black text-primary leading-tight line-clamp-1 group-hover:translate-x-1 transition-transform duration-300">
              {item.name}
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                <Clock className="w-3 h-3" />
                <span>{item.time || '5-10 мин'}</span>
              </p>
              <div className="w-1 h-1 rounded-full bg-primary/20" />
              <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{item.category}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.03]">
            <div className="flex flex-col">
               <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Цена</span>
               <span className="text-xl font-black text-primary tracking-tighter leading-none">
                 {item.price.toLocaleString()} <span className="text-[10px] uppercase ml-0.5">сум</span>
               </span>
            </div>
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
