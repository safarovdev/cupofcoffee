
"use client";

import { useState, useEffect } from "react";
import { Check, ShoppingBag, Coffee, Wine, IceCream, Beaker, Cookie } from "lucide-react";
import { MenuItem } from "./Menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

function LargePlaceholder({ category, imageUrl }: { category: string, imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-full h-full relative">
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
      case 'coffee': return <Coffee className="w-16 h-16" />;
      case 'ice-coffee': return <Coffee className="w-16 h-16" />;
      case 'mojito': return <Wine className="w-16 h-16" />;
      case 'mojito-carafe': return <Beaker className="w-16 h-16" />;
      case 'tea': return <Coffee className="w-16 h-16 rotate-12" />;
      case 'ice-tea': return <Wine className="w-16 h-16" />;
      case 'milkshakes': return <Wine className="w-16 h-16" />;
      case 'ice-cream': return <IceCream className="w-16 h-16" />;
      default: return <Cookie className="w-16 h-16" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-primary/10">
      {getIcon()}
    </div>
  );
}

export function CustomizationModal({ isOpen, onClose, item }: CustomizationModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const defaultSize = item.sizes ? Object.keys(item.sizes)[0] : "Стандарт";
  const [selectedSize, setSelectedSize] = useState(defaultSize);

  useEffect(() => {
    if (item.sizes) {
      setSelectedSize(Object.keys(item.sizes)[0]);
    } else {
      setSelectedSize("Стандарт");
    }
  }, [item]);

  const currentPrice = item.sizes ? item.sizes[selectedSize] : item.price;

  const handleOrder = () => {
    addToCart(item, selectedSize !== "Стандарт" ? selectedSize : undefined, undefined, currentPrice);
    toast({
      title: "Добавлено!",
      description: `${item.name} (${selectedSize}) добавлен в ваш заказ.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-none sm:rounded-[2rem] z-[1000]">
        <div className="flex flex-col md:flex-row h-full max-h-[85vh] overflow-y-auto no-scrollbar">
          <div className="md:w-1/2 relative h-40 md:h-auto bg-muted">
            <LargePlaceholder category={item.category} imageUrl={item.imageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <DialogTitle className="text-lg sm:text-xl font-headline font-black text-white drop-shadow-md uppercase tracking-tight">
                {item.name}
              </DialogTitle>
              <p className="text-white/90 text-xs mt-0.5 font-bold">
                {currentPrice} сум
              </p>
            </div>
          </div>

          <div className="md:w-1/2 p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-primary/40">Описание</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {item.description}
                </p>
                {item.ingredients && item.ingredients.length > 0 && (
                  <p className="text-[9px] text-muted-foreground/40 italic">
                    Состав: {item.ingredients.join(", ")}
                  </p>
                )}
              </div>

              {item.sizes && (
                <div className="space-y-2.5">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-primary/40">Вариант / Объем</h4>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-col gap-1.5">
                    {Object.keys(item.sizes).map((s) => (
                      <div key={s} className="flex items-center">
                        <RadioGroupItem value={s} id={`size-${s}`} className="sr-only" />
                        <Label
                          htmlFor={`size-${s}`}
                          className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                            selectedSize === s
                              ? "border-primary bg-primary/5 text-primary font-bold"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {selectedSize === s && <Check className="w-3 h-3" />}
                            {s}
                          </div>
                          <span className="opacity-60 font-black">{item.sizes![s]} сум</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleOrder}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 font-black text-xs shadow-lg shadow-primary/10 gap-2 uppercase tracking-tight"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                ДОБАВИТЬ — {currentPrice} сум
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
