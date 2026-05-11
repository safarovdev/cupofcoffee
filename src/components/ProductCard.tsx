"use client";

import { Plus, Coffee, Wine, IceCream, Cookie, Beaker, ShoppingBag } from "lucide-react";
import { MenuItem } from "./Menu";
import { CustomizationModal } from "./CustomizationModal";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ProductCardProps {
  item: MenuItem;
  isMinimal?: boolean;
}

function ItemPlaceholder({ category, imageUrl }: { category: string, imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-full h-full relative transition-transform group-hover:scale-105 duration-700">
        <Image 
          src={imageUrl} 
          alt="Product" 
          fill 
          className="object-cover"
        />
      </div>
    );
  }

  const getIcon = () => {
    switch (category) {
      case 'coffee': return <Coffee className="w-7 h-7" />;
      case 'ice-coffee': return <Coffee className="w-7 h-7" />;
      case 'mojito': return <Wine className="w-7 h-7" />;
      case 'mojito-carafe': return <Beaker className="w-7 h-7" />;
      case 'tea': return <Coffee className="w-7 h-7 rotate-12" />;
      case 'ice-tea': return <Wine className="w-7 h-7" />;
      case 'milkshakes': return <Wine className="w-7 h-7" />;
      case 'ice-cream': return <IceCream className="w-7 h-7" />;
      default: return <Cookie className="w-7 h-7" />;
    }
  };

  return (
    <div className="w-full h-full bg-muted/30 flex items-center justify-center text-primary/5 transition-transform group-hover:scale-105 duration-700">
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
          className="bg-white text-primary px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
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
        className="group relative flex flex-col bg-white p-2.5 rounded-2xl border border-black/[0.02] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] w-full"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/10">
          <ItemPlaceholder category={item.category} imageUrl={item.imageUrl} />
          
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-2.5 right-2.5 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all active:scale-90 z-10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="px-1 pb-1 pt-2.5 flex flex-col flex-1 justify-between min-h-[70px]">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-primary leading-tight line-clamp-1 group-hover:text-primary/70 transition-colors uppercase tracking-tight">
              {item.name}
            </h3>
            <span className="text-[8px] font-black text-primary/20 uppercase tracking-widest">{item.category}</span>
          </div>

          <div className="pt-1.5">
            <span className="text-base font-black text-primary tracking-tighter">
              {item.price.toLocaleString()} <span className="text-[9px] uppercase font-bold text-primary/30">сум</span>
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