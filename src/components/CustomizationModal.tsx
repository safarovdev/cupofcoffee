"use client";

import { useState } from "react";
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
  const [size, setSize] = useState("M");
  const [milk, setMilk] = useState("regular");

  const isDrink = item.category === "coffee" || item.category === "tea";

  const handleOrder = () => {
    addToCart(item, isDrink ? size : undefined, isDrink ? milk : undefined);
    toast({
      title: "Добавлено!",
      description: `${item.name} добавлен в ваш заказ.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-none sm:rounded-[2rem]">
        <div className="flex flex-col md:flex-row h-full max-h-[95vh] overflow-y-auto custom-scrollbar">
          {/* Left: Image Side */}
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
                {item.price} ₽
              </p>
            </div>
          </div>

          {/* Right: Options Side */}
          <div className="md:w-1/2 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Ингредиенты</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.ingredients.join(", ")}
              </p>
            </div>

            <Separator />

            {isDrink && (
              <>
                {/* Size */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Объем</h4>
                  <RadioGroup value={size} onValueChange={setSize} className="flex gap-3">
                    {["S", "M", "L"].map((v) => (
                      <div key={v} className="flex-1">
                        <RadioGroupItem value={v} id={`size-${v}`} className="sr-only" />
                        <Label
                          htmlFor={`size-${v}`}
                          className={`flex items-center justify-center h-10 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                            size === v
                              ? "border-primary bg-primary/5 text-primary font-bold"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {v}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Milk */}
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
              </>
            )}

            {!isDrink && (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-xs text-muted-foreground italic text-center leading-tight">
                  Все блюда готовятся из свежих фермерских продуктов сразу после вашего заказа.
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button 
                onClick={handleOrder}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 sm:h-14 font-bold text-base sm:text-lg shadow-lg shadow-primary/20 gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Добавить в заказ
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
