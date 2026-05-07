"use client";

import { useState } from "react";
import { Coffee, Leaf, Cake, Croissant, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { DietaryHelper } from "./DietaryHelper";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  price: number;
  image: string;
  category: string;
};

const MENU_DATA: MenuItem[] = [
  // Coffee
  {
    id: "1",
    name: "Classic Latte",
    category: "coffee",
    description: "Espresso combined with steamed milk and a thin layer of foam.",
    ingredients: ["Espresso", "Whole Milk"],
    allergens: ["Dairy"],
    price: 4.5,
    image: PlaceHolderImages.find(img => img.id === 'latte')?.imageUrl || "",
  },
  {
    id: "2",
    name: "Aroma Espresso",
    category: "coffee",
    description: "Our signature dark roast with rich crema and chocolate notes.",
    ingredients: ["Dark Roast Coffee Beans"],
    allergens: [],
    price: 3.2,
    image: PlaceHolderImages.find(img => img.id === 'espresso')?.imageUrl || "",
  },
  // Tea
  {
    id: "3",
    name: "Ceremonial Matcha",
    category: "tea",
    description: "Whisked Japanese green tea powder with velvety steamed milk.",
    ingredients: ["Matcha Powder", "Milk", "Honey"],
    allergens: ["Dairy"],
    price: 5.5,
    image: PlaceHolderImages.find(img => img.id === 'matcha')?.imageUrl || "",
  },
  {
    id: "4",
    name: "Classic Earl Grey",
    category: "tea",
    description: "Black tea infused with citrusy bergamot oil.",
    ingredients: ["Black Tea", "Bergamot Oil"],
    allergens: [],
    price: 3.8,
    image: PlaceHolderImages.find(img => img.id === 'ear-grey')?.imageUrl || "",
  },
  // Desserts
  {
    id: "5",
    name: "Golden Croissant",
    category: "desserts",
    description: "Buttery, flaky traditional French pastry baked fresh every morning.",
    ingredients: ["Flour", "Butter", "Yeast", "Milk"],
    allergens: ["Gluten", "Dairy"],
    price: 3.5,
    image: PlaceHolderImages.find(img => img.id === 'croissant')?.imageUrl || "",
  },
  {
    id: "6",
    name: "Tiramisu Delight",
    category: "desserts",
    description: "Ladyfingers dipped in coffee, layered with mascarpone cream.",
    ingredients: ["Mascarpone", "Coffee", "Eggs", "Sugar", "Cocoa"],
    allergens: ["Dairy", "Eggs", "Gluten"],
    price: 6.5,
    image: PlaceHolderImages.find(img => img.id === 'tiramisu')?.imageUrl || "",
  },
  // Breakfasts
  {
    id: "7",
    name: "Artisan Avocado Toast",
    category: "breakfasts",
    description: "Sourdough bread topped with smashed avocado, chili flakes, and seeds.",
    ingredients: ["Sourdough", "Avocado", "Pumpkin Seeds", "Chili"],
    allergens: ["Gluten"],
    price: 12.0,
    image: PlaceHolderImages.find(img => img.id === 'avocado-toast')?.imageUrl || "",
  },
  {
    id: "8",
    name: "Berry Acai Bowl",
    category: "breakfasts",
    description: "Organic acai blended with berries, topped with granola and fruit.",
    ingredients: ["Acai", "Blueberries", "Banana", "Granola", "Coconut Chips"],
    allergens: ["Gluten"],
    price: 11.5,
    image: PlaceHolderImages.find(img => img.id === 'acai-bowl')?.imageUrl || "",
  },
];

const CATEGORIES = [
  { id: "coffee", name: "Coffee", icon: Coffee },
  { id: "tea", name: "Tea", icon: Leaf },
  { id: "desserts", name: "Desserts", icon: Cake },
  { id: "breakfasts", name: "Breakfasts", icon: Croissant },
];

export function Menu() {
  const [activeCategory, setActiveCategory] = useState("coffee");

  const filteredItems = MENU_DATA.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-12">
      {/* Category Nav */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-foreground mb-2">Our Menu</h2>
          <p className="text-muted-foreground max-w-lg">Hand-picked ingredients and artisanal techniques to bring you the finest flavors in every bite and sip.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10 flex items-start gap-4 mb-8">
        <Info className="w-6 h-6 text-accent mt-1 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-accent font-headline text-lg">AI Dietary Companion Available</p>
          <p className="text-sm text-muted-foreground">Select items to analyze them against your dietary restrictions for a safer dining experience.</p>
        </div>
        <div className="ml-auto">
          <DietaryHelper currentMenu={MENU_DATA} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}