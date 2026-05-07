"use client";

import { useState } from "react";
import { Coffee, Leaf, Cake, Croissant, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  price: number;
  image: string;
  category: string;
  isRecommended?: boolean;
};

const MENU_DATA: MenuItem[] = [
  {
    id: "1",
    name: "Классический Латте",
    category: "coffee",
    description: "Эспрессо в сочетании с нежным вспененным молоком.",
    ingredients: ["Эспрессо", "Цельное молоко"],
    allergens: ["Лактоза"],
    price: 320,
    image: PlaceHolderImages.find(img => img.id === 'latte')?.imageUrl || "",
    isRecommended: true,
  },
  {
    id: "2",
    name: "Эспрессо Арома",
    category: "coffee",
    description: "Наш фирменный темный бленд с насыщенной пенкой крема.",
    ingredients: ["Зерна темной обжарки"],
    allergens: [],
    price: 180,
    image: PlaceHolderImages.find(img => img.id === 'espresso')?.imageUrl || "",
  },
  {
    id: "3",
    name: "Церемониальный Матча",
    category: "tea",
    description: "Взбитый японский зеленый чай с бархатистым молоком.",
    ingredients: ["Порошок матча", "Молоко", "Мед"],
    allergens: ["Лактоза"],
    price: 380,
    image: PlaceHolderImages.find(img => img.id === 'matcha')?.imageUrl || "",
    isRecommended: true,
  },
  {
    id: "4",
    name: "Эрл Грей Классик",
    category: "tea",
    description: "Черный чай с добавлением масла бергамота.",
    ingredients: ["Черный чай", "Масло бергамота"],
    allergens: [],
    price: 250,
    image: PlaceHolderImages.find(img => img.id === 'ear-grey')?.imageUrl || "",
  },
  {
    id: "5",
    name: "Золотистый Круассан",
    category: "desserts",
    description: "Сливочная и хрустящая французская выпечка.",
    ingredients: ["Мука", "Сливочное масло", "Дрожжи"],
    allergens: ["Глютен", "Лактоза"],
    price: 210,
    image: PlaceHolderImages.find(img => img.id === 'croissant')?.imageUrl || "",
    isRecommended: true,
  },
  {
    id: "6",
    name: "Тирамису Делайт",
    category: "desserts",
    description: "Печенье савоярди в кофе с кремом маскарпоне.",
    ingredients: ["Маскарпоне", "Кофе", "Яйца", "Какао"],
    allergens: ["Лактоза", "Яйца", "Глютен"],
    price: 450,
    image: PlaceHolderImages.find(img => img.id === 'tiramisu')?.imageUrl || "",
  },
  {
    id: "7",
    name: "Тост с Авокадо",
    category: "breakfasts",
    description: "Хлеб на закваске с нежным авокадо и семенами.",
    ingredients: ["Сурдо", "Авокадо", "Семена тыквы", "Чили"],
    allergens: ["Глютен"],
    price: 650,
    image: PlaceHolderImages.find(img => img.id === 'avocado-toast')?.imageUrl || "",
    isRecommended: true,
  },
  {
    id: "8",
    name: "Ягодный Асаи Боул",
    category: "breakfasts",
    description: "Органический асаи с ягодами, гранолой и фруктами.",
    ingredients: ["Асаи", "Черника", "Банан", "Гранола"],
    allergens: ["Глютен"],
    price: 580,
    image: PlaceHolderImages.find(img => img.id === 'acai-bowl')?.imageUrl || "",
  },
];

const CATEGORIES = [
  { id: "coffee", name: "Кофе", icon: Coffee },
  { id: "tea", name: "Чай", icon: Leaf },
  { id: "desserts", name: "Десерты", icon: Cake },
  { id: "breakfasts", name: "Завтраки", icon: Croissant },
];

export function Menu() {
  const [activeCategory, setActiveCategory] = useState("coffee");

  const recommendedItems = MENU_DATA.filter(item => item.isRecommended);
  const filteredItems = MENU_DATA.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-16">
      {/* Recommendations Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Star className="w-6 h-6 fill-current" />
          <h2 className="text-3xl font-headline font-bold">Рекомендуем попробовать</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedItems.map((item) => (
            <ProductCard key={`rec-${item.id}`} item={item} />
          ))}
        </div>
      </section>

      {/* Main Menu Section with Category Tabs */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-headline font-bold text-foreground mb-2">Наше меню</h2>
            <p className="text-muted-foreground max-w-lg">Выберите категорию, чтобы увидеть все наши предложения.</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap snap-start",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-bold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid for Filtered Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}