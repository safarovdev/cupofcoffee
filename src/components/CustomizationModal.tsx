"use client";

import { useState } from "react";
import { X, Check, ShoppingBag } from "lucide-react";
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

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

export function CustomizationModal({ isOpen, onClose, item }: CustomizationModalProps) {
  const [size, setSize] = useState("M");
  const [milk, setMilk] = useState("regular");
  const [syrup, setSyrup] = useState("none");

  const isDrink = item.category === "coffee" || item.category === "tea";

  const handleOrder = () => {
    // In a real app, this would add to cart
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-border sm:rounded-3xl">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Left: Image Side */}
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent md:bg-gradient-to-r" />
            <div className="absolute bottom-6 left-6 right-6">
              <DialogTitle className="text-3xl font-headline font-bold text-white drop-shadow-lg">
                {item.name}
              </DialogTitle>
              <p className="text-white/90 text-sm mt-2 font-medium drop-shadow-md">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Right: Options Side */}
          <div className="md:w-1/2 p-8 space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Ingredients</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.ingredients.join(", ")}
              </p>
            </div>

            <Separator className="bg-border/50" />

            {isDrink && (
              <>
                {/* Size */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Volume</h4>
                  <RadioGroup value={size} onValueChange={setSize} className="flex gap-4">
                    {["S", "M", "L"].map((v) => (
                      <div key={v} className="flex-1">
                        <RadioGroupItem value={v} id={`size-${v}`} className="sr-only" />
                        <Label
                          htmlFor={`size-${v}`}
                          className={`flex items-center justify-center h-12 rounded-xl border-2 cursor-pointer transition-all ${
                            size === v
                              ? "border-accent bg-accent/10 text-accent font-bold"
                              : "border-border text-muted-foreground hover:border-accent/50"
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
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Milk Type</h4>
                  <RadioGroup value={milk} onValueChange={setMilk} className="grid grid-cols-2 gap-3">
                    {[
                      { id: "regular", name: "Whole Milk" },
                      { id: "oat", name: "Oat Milk" },
                      { id: "coconut", name: "Coconut Milk" },
                      { id: "almond", name: "Almond Milk" },
                    ].map((m) => (
                      <div key={m.id}>
                        <RadioGroupItem value={m.id} id={`milk-${m.id}`} className="sr-only" />
                        <Label
                          htmlFor={`milk-${m.id}`}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                            milk === m.id
                              ? "border-accent bg-accent/10 text-accent font-bold"
                              : "border-border text-muted-foreground hover:border-accent/50"
                          }`}
                        >
                          {milk === m.id && <Check className="w-4 h-4" />}
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
                <p className="text-xs text-muted-foreground italic text-center">
                  Artisanal food items are prepared fresh to order. For specific modifications, please consult our baristas.
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                onClick={handleOrder}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-14 font-bold text-lg shadow-xl shadow-accent/20 gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}