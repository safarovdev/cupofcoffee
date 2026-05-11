
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
import { Separator } from "@/components/ui/separator";
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
  const [milk, setMilk] = useState("regular");

  useEffect(() => {
    if (item.sizes) {
      setSelectedSize(Object.keys(item.sizes)[0]);
    } else {
      setSelectedSize("Стандарт");
    }
  }, [item]);

  const isDrink = item.category === "coffee" || item.category === "tea" || item.category === "ice-coffee";
  const currentPrice = item.sizes ? item.sizes[selectedSize] : item.price;

  const handleOrder = () => {
    addToCart(item, selectedSize !== "Стандарт" ? selectedSize : undefined, isDrink ? milk : undefined, currentPrice);
    toast({
      title: "Добавлено!",
      description: `${item.name} (${selectedSize}) добавлен в ваш заказ.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-none sm:rounded-[2rem]">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="md:w-1/2 relative h-48 md:h-auto bg-muted">
            <LargePlaceholder category={item.category} imageUrl={item.imageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <DialogTitle className="text-xl sm:text-2xl font-headline font-black text-white drop-shadow-md uppercase tracking-tight">
                {item.name}
              </DialogTitle>
              <p className="text-white/90 text-sm mt-0.5 font-bold">
                {currentPrice} сум
              </p>
            </div>
          </div>

          <div className="md:w-1/2 p-5 sm:p-6 space-y-5 sm:space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Описание</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                {item.ingredients && item.ingredients.length > 0 && (
                  <p className="text-[10px] text-muted-foreground/40 italic">
                    Ингредиенты: {item.ingredients.join(", ")}
                  </p>
                )}
              </div>

              {item.sizes && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Объем / Тип</h4>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-col gap-1.5">
                    {Object.keys(item.sizes).map((s) => (
                      <div key={s} className="flex items-center">
                        <RadioGroupItem value={s} id={`size-${s}`} className="sr-only" />
                        <Label
                          htmlFor={`size-${s}`}
                          className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                            selectedSize === s
                              ? "border-primary bg-primary/5 text-primary font-bold"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {selectedSize === s && <Check className="w-3 h-3" />}
                            {s}
                          </div>
                          <span className="opacity-60">{item.sizes![s]} сум</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {item.category === "coffee" && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Тип молока</h4>
                  <RadioGroup value={milk} onValueChange={setMilk} className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "regular", name: "Обычное" },
                      { id: "oat", name: "Овсяное" },
                      { id: "coconut", name: "Кокосовое" },
                      { id: "almond", name: "Миндальное" },
                    ].map((m) => (
                      <div key={m.id}>
                        <RadioGroupItem value={m.id} id={`milk-${m.id}`} className="sr-only" />
                        <Label
                          htmlFor={`milk-${m.id}`}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-[10px] ${
                            milk === m.id
                              ? "border-primary bg-primary/5 text-primary font-bold"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {milk === m.id && <Check className="w-3 h-3" />}
                          {m.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>

            <div className="pt-4 sm:pt-6">
              <Button 
                onClick={handleOrder}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-black text-sm shadow-lg shadow-primary/20 gap-2 uppercase tracking-tight"
              >
                <ShoppingBag className="w-4 h-4" />
                В корзину — {currentPrice} сум
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
