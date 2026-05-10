
"use client";

import { Plus, Coffee, Wine, IceCream, Cookie, Beaker, ShoppingBag } from "lucide-react";
import { MenuItem } from "./Menu";
import { CustomizationModal } from "./CustomizationModal";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  item: MenuItem;
  isMinimal?: boolean;
}

function ItemPlaceholder({ category }: { category: string }) {
  const getIcon = () => {
    switch (category) {
      case 'coffee': return <Coffee className="w-8 h-8" />;
      case 'ice-coffee': return <Coffee className="w-8 h-8" />;
      case 'mojito': return <Wine className="w-8 h-8" />;
      case 'mojito-carafe': return <Beaker className="w-8 h-8" />;
      case 'tea': return <Coffee className="w-8 h-8 rotate-12" />;
      case 'ice-tea': return <Wine className="w-8 h-8" />;
      case 'milkshakes': return <Wine className="w-8 h-8" />;
      case 'ice-cream': return <IceCream className="w-8 h-8" />;
      default: return <Cookie className="w-8 h-8" />;
    }
  };

  return (
    <div className="w-full h-full bg-muted/30 flex items-center justify-center text-primary/5 transition-transform group-hover:scale-110 duration-1000">
      {getIcon()}
    </div>
  );
}

export function ProductCard({ item, isMinimal = false }: ProductCardProps) {
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

  if (isMinimal) {
    return (
      <>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          className="bg-white text-primary px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
        >
          <ShoppingBag className="w-4 h-4" />
          Выбрать
        </button>
        <CustomizationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          item={item} 
        />
      </>
    );
  }

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col bg-white p-3 rounded-[2.5rem] border border-black/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer active:scale-[0.97] w-full"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-muted/10">
          <ItemPlaceholder category={item.category} />
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 bg-primary text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-90 z-10"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="px-2 pb-2 pt-3 flex flex-col flex-1 justify-between min-h-[90px]">
          <div className="space-y-1">
            <h3 className="text-base font-black text-primary leading-tight line-clamp-1 group-hover:text-primary/70 transition-colors uppercase tracking-tight">
              {item.name}
            </h3>
            <span className="text-[9px] font-black text-primary/20 uppercase tracking-[0.2em]">{item.category}</span>
          </div>

          <div className="pt-2">
            <span className="text-lg font-black text-primary tracking-tighter">
              {item.price.toLocaleString()} <span className="text-[10px] uppercase font-bold text-primary/30">сум</span>
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
