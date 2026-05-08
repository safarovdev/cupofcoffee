
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
  // Кофе
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
  // Айс Кофе
  {
    id: "ic1",
    name: "Айс Капучино",
    category: "ice-coffee",
    description: "Холодный кофе с густой молочной пеной и льдом.",
    ingredients: ["Эспрессо", "Молоко", "Лед"],
    allergens: ["Лактоза"],
    price: 340,
    image: "https://picsum.photos/seed/icecap/600/600",
    rating: 4.7,
    time: "5-7 мин",
  },
  // Мохито
  {
    id: "m1",
    name: "Классический Мохито",
    category: "mojito",
    description: "Освежающий напиток с лаймом, мятой и газировкой.",
    ingredients: ["Лайм", "Мята", "Тростниковый сахар", "Содовая"],
    allergens: [],
    price: 420,
    image: PlaceHolderImages.find(img => img.id === 'mojito')?.imageUrl || "",
    rating: 4.9,
    time: "5 мин",
  },
  // АйсТи
  {
    id: "it1",
    name: "Персиковый АйсТи",
    category: "ice-tea",
    description: "Домашний холодный чай с ароматом спелого персика.",
    ingredients: ["Черный чай", "Персиковый сироп", "Лед", "Лимон"],
    allergens: [],
    price: 280,
    image: "https://picsum.photos/seed/icetea/600/600",
    rating: 4.6,
    time: "5 мин",
  },
  // Чай
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
    id: "tea2",
    name: "Эрл Грей",
    category: "tea",
    description: "Классический черный чай с ароматом бергамота.",
    ingredients: ["Черный чай", "Бергамот"],
    allergens: [],
    price: 250,
    image: PlaceHolderImages.find(img => img.id === 'earl-grey')?.imageUrl || "",
    rating: 4.5,
    time: "5-7 мин",
  },
  // Милкшейки
  {
    id: "ms1",
    name: "Клубничный Милкшейк",
    category: "milkshakes",
    description: "Густой коктейль из фермерского молока и свежей клубники.",
    ingredients: ["Молоко", "Мороженое", "Клубника"],
    allergens: ["Лактоза"],
    price: 390,
    image: PlaceHolderImages.find(img => img.id === 'milkshake')?.imageUrl || "",
    rating: 4.8,
    time: "7-10 мин",
  },
  // Мороженое
  {
    id: "icr1",
    name: "Ванильное Мороженое",
    category: "ice-cream",
    description: "Натуральный пломбир с ванилью и топпингом на выбор.",
    ingredients: ["Сливки", "Ваниль", "Сахар"],
    allergens: ["Лактоза"],
    price: 150,
    image: PlaceHolderImages.find(img => img.id === 'ice-cream')?.imageUrl || "",
    rating: 4.9,
    time: "3 мин",
  },
  // Десерты
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
];

const CATEGORIES = [
  { id: "coffee", name: "Кофе" },
  { id: "ice-coffee", name: "Айс Кофе" },
  { id: "mojito", name: "Мохито" },
  { id: "ice-tea", name: "АйсТи" },
  { id: "tea", name: "Чай" },
  { id: "milkshakes", name: "Милкшейки" },
  { id: "ice-cream", name: "Мороженое" },
  { id: "desserts", name: "Десерты" },
];

export function Menu() {
  const { searchQuery } = useCart();
  const [activeFilter, setActiveFilter] = useState("all");

  const applyFilters = (items: MenuItem[]) => {
    return items.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || 
               item.ingredients.some(i => i.toLowerCase().includes(q));
      }
      if (activeFilter === "fast") return parseInt(item.time) <= 15;
      if (activeFilter === "rating") return item.rating >= 4.8;
      if (activeFilter === "promo") return item.discount !== undefined;
      return true;
    });
  };

  return (
    <div className="space-y-8">
      {/* Search Header Info */}
      {searchQuery && (
        <h2 className="text-2xl font-bold font-headline px-1">
          Результаты поиска: {searchQuery}
        </h2>
      )}

      {/* Main Content */}
      {searchQuery ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
            {applyFilters(MENU_DATA).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
          {applyFilters(MENU_DATA).length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
              <p className="text-muted-foreground font-bold">Ничего не найдено.</p>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-12">
          {/* Promo Banner */}
          <div className="relative w-full aspect-[3/1] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'promo-sushi')?.imageUrl || ""} 
              alt="Promotion"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center p-8 text-white">
              <h3 className="text-2xl md:text-4xl font-bold font-headline mb-2 leading-tight uppercase">Скидка -30% на завтраки</h3>
              <p className="text-sm md:text-lg opacity-90 mb-4 font-medium">Ваша бодрость — наша забота</p>
              <div className="flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all uppercase tracking-widest">
                В меню <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Categories Sections */}
          {CATEGORIES.map((cat) => {
            const items = applyFilters(MENU_DATA.filter(i => i.category === cat.id));
            if (items.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-2xl font-black font-headline text-primary uppercase tracking-tighter">
                    {cat.name}
                  </h2>
                  <Button variant="ghost" className="text-muted-foreground font-bold gap-1 hover:bg-transparent p-0 text-xs uppercase tracking-widest">
                    Все <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 -mx-4 px-4 sm:mx-0 sm:px-1">
                  {items.map((item) => (
                    <div key={item.id} className="min-w-[280px] md:min-w-[320px]">
                      <ProductCard item={item} />
                    </div>
                  ))}
                  <div className="min-w-[40px] h-1" />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
