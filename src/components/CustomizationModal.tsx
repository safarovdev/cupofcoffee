
"use client";

import { useState, useEffect } from "react";
import { Check, ShoppingBag } from "lucide-react";
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
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
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
        <div className="flex flex-col md:flex-row h-full max-h-[95vh] overflow-y-auto custom-scrollbar">
          <div className="md:w-1/2 relative h-48 md:h-auto">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <DialogTitle className="text-2xl sm:text-3xl font-headline font-bold text-white">
                {item.name}
              </DialogTitle>
              <p className="text-white/90 text-sm mt-1 font-bold">
                {currentPrice} сум
              </p>
            </div>
          </div>

          <div className="md:w-1/2 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Описание</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              <p className="text-xs text-muted-foreground/60 italic">
                Ингредиенты: {item.ingredients.join(", ")}
              </p>
            </div>

            <Separator />

            {item.sizes && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Выберите объем / тип</h4>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-col gap-2">
                  {Object.keys(item.sizes).map((s) => (
                    <div key={s} className="flex items-center">
                      <RadioGroupItem value={s} id={`size-${s}`} className="sr-only" />
                      <Label
                        htmlFor={`size-${s}`}
                        className={`flex items-center justify-between w-full p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                          selectedSize === s
                            ? "border-primary bg-primary/5 text-primary font-bold"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {selectedSize === s && <Check className="w-4 h-4" />}
                          {s}
                        </div>
                        <span className="text-xs">{item.sizes![s]} сум</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {item.category === "coffee" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Тип молока</h4>
                <RadioGroup value={milk} onValueChange={setMilk} className="grid grid-cols-2 gap-2">
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
                        className={`flex items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all text-xs ${
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

            <div className="pt-2">
              <Button 
                onClick={handleOrder}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 sm:h-14 font-bold text-base sm:text-lg shadow-lg shadow-primary/20 gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                В корзину — {currentPrice} сум
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
