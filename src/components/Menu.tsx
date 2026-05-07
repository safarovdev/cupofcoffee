"use client";

import { useState } from "react";
import { SlidersHorizontal, Rocket, Star, Percent, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

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
  rating: number;
  time: string;
  discount?: number;
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
    rating: 4.8,
    time: "5-10 мин",
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
    rating: 4.9,
    time: "3-5 мин",
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
    rating: 4.7,
    time: "7-12 мин",
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
    rating: 4.9,
    time: "5-10 мин",
    discount: 15,
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
    rating: 4.6,
    time: "5-10 мин",
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
    rating: 4.8,
    time: "10-15 мин",
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
    rating: 4.5,
    time: "10-15 мин",
    discount: 20,
  },
];

const CATEGORIES = [
  { id: "coffee", name: "Кофе", image: PlaceHolderImages.find(img => img.id === 'latte')?.imageUrl },
  { id: "tea", name: "Чай", image: PlaceHolderImages.find(img => img.id === 'matcha')?.imageUrl },
  { id: "desserts", name: "Десерты", image: PlaceHolderImages.find(img => img.id === 'croissant')?.imageUrl },
  { id: "breakfasts", name: "Завтраки", image: PlaceHolderImages.find(img => img.id === 'avocado-toast')?.imageUrl },
];

const FILTERS = [
  { id: "all", name: "Все", icon: SlidersHorizontal },
  { id: "fast", name: "До 15 мин", icon: Rocket },
  { id: "rating", name: "Рейтинг 4.8+", icon: Star },
  { id: "promo", name: "Акции", icon: Percent },
];

export function Menu() {
  const { searchQuery } = useCart();
  const [activeCategory, setActiveCategory] = useState("coffee");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredItems = MENU_DATA.filter(item => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(q) || 
                          item.ingredients.some(i => i.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    } else {
      // If no search, use category
      if (item.category !== activeCategory) return false;
    }
    
    // Quick filters
    if (activeFilter === "fast") return parseInt(item.time) <= 15;
    if (activeFilter === "rating") return item.rating >= 4.8;
    if (activeFilter === "promo") return item.discount !== undefined;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Category Icons Row - Hide when searching for better UX */}
      {!searchQuery && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold font-headline px-1">Что заказать</h2>
          <div className="flex items-start gap-6 overflow-x-auto no-scrollbar pb-2 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center gap-2 group min-w-[70px]"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ring-2 ring-transparent group-active:scale-95",
                  activeCategory === cat.id ? "ring-primary scale-105 shadow-lg" : "grayscale-[20%] group-hover:grayscale-0"
                )}>
                  <Image 
                    src={cat.image || ""} 
                    alt={cat.name} 
                    width={64} 
                    height={64} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className={cn(
                  "text-xs font-bold transition-colors",
                  activeCategory === cat.id ? "text-primary" : "text-muted-foreground"
                )}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all whitespace-nowrap text-sm font-bold",
                activeFilter === filter.id
                  ? "bg-secondary text-foreground border-secondary"
                  : "bg-white border-border text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {filter.name}
            </button>
          );
        })}
      </div>

      {/* Promo Banner - Hide when searching */}
      {!searchQuery && (
        <div className="relative w-full aspect-[3/1] rounded-[2.5rem] overflow-hidden group cursor-pointer">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'promo-sushi')?.imageUrl || ""} 
            alt="Promotion"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center p-8 text-white">
            <h3 className="text-2xl md:text-4xl font-bold font-headline mb-2 leading-tight">Скидка -30% на завтраки</h3>
            <p className="text-sm md:text-lg opacity-90 mb-4 font-medium">Ваша бодрость — наша забота</p>
            <div className="flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all">
              Посмотреть меню <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Popular Section - Hide when searching */}
      {!searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-bold font-headline">Популярное сейчас</h2>
            <Button variant="ghost" className="text-primary font-bold gap-1 hover:bg-transparent p-0">
              Все <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
            {MENU_DATA.filter(i => i.isRecommended).map((item) => (
              <div key={`pop-${item.id}`} className="min-w-[280px] md:min-w-[320px]">
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid */}
      <section className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold font-headline px-1">
          {searchQuery ? `Результаты поиска: ${searchQuery}` : `Меню: ${CATEGORIES.find(c => c.id === activeCategory)?.name}`}
        </h2>
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
            <p className="text-muted-foreground font-bold">Ничего не найдено. Попробуйте другой запрос.</p>
          </div>
        )}
      </section>
    </div>
  );
}
