
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
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
  // КОФЕ
  { id: "c1", name: "Эспрессо", category: "coffee", description: "Классический крепкий кофе.", ingredients: ["Кофе"], allergens: [], price: 15, image: "https://picsum.photos/seed/espresso1/600/600", rating: 4.9, time: "3 мин" },
  { id: "c2", name: "Американо", category: "coffee", description: "Эспрессо с добавлением горячей воды.", ingredients: ["Кофе", "Вода"], allergens: [], price: 20, image: "https://picsum.photos/seed/americano/600/600", rating: 4.7, time: "4 мин" },
  { id: "c3", name: "Капучино", category: "coffee", description: "Кофе с пышной молочной пенкой.", ingredients: ["Кофе", "Молоко"], allergens: ["Лактоза"], price: 25, image: "https://picsum.photos/seed/cappuccino/600/600", rating: 4.8, time: "5 мин" },
  { id: "c4", name: "Латте", category: "coffee", description: "Нежный кофейный напиток с большим количеством молока.", ingredients: ["Кофе", "Молоко"], allergens: ["Лактоза"], price: 25, image: PlaceHolderImages.find(img => img.id === 'latte')?.imageUrl || "", rating: 4.8, time: "5 мин" },
  { id: "c5", name: "Флэт Уайт", category: "coffee", description: "Двойной эспрессо с тонким слоем молочной пены.", ingredients: ["Кофе", "Молоко"], allergens: ["Лактоза"], price: 30, image: "https://picsum.photos/seed/flatwhite/600/600", rating: 4.9, time: "5 мин" },
  { id: "c6", name: "Лунго", category: "coffee", description: "Кофе более длительной экстракции.", ingredients: ["Кофе", "Вода"], allergens: [], price: 25, image: "https://picsum.photos/seed/lungo/600/600", rating: 4.6, time: "4 мин" },
  { id: "c7", name: "Раф", category: "coffee", description: "Кофе со сливками и ванильным сахаром.", ingredients: ["Кофе", "Сливки", "Ванильный сахар"], allergens: ["Лактоза"], price: 35, image: "https://picsum.photos/seed/raf/600/600", rating: 5.0, time: "6 мин" },
  { id: "c8", name: "Какао", category: "coffee", description: "Горячий шоколадный напиток на молоке.", ingredients: ["Какао-порошок", "Молоко"], allergens: ["Лактоза"], price: 20, image: "https://picsum.photos/seed/cocoa/600/600", rating: 4.8, time: "5 мин" },
  { id: "c9", name: "Горячий шоколад", category: "coffee", description: "Густой и насыщенный десертный напиток.", ingredients: ["Шоколад", "Молоко"], allergens: ["Лактоза"], price: 25, image: "https://picsum.photos/seed/hotchoc/600/600", rating: 4.9, time: "6 мин" },

  // АЙС КОФЕ
  { id: "ic1", name: "Айс Американо", category: "ice-coffee", description: "Холодный американо со льдом.", ingredients: ["Кофе", "Лед"], allergens: [], price: 25, image: "https://picsum.photos/seed/iceam/600/600", rating: 4.7, time: "4 мин" },
  { id: "ic2", name: "Айс Капучино", category: "ice-coffee", description: "Освежающий капучино со льдом.", ingredients: ["Кофе", "Молоко", "Лед"], allergens: ["Лактоза"], price: 35, image: "https://picsum.photos/seed/icecap/600/600", rating: 4.8, time: "5 мин" },
  { id: "ic3", name: "Айс Латте", category: "ice-coffee", description: "Холодный латте со льдом.", ingredients: ["Кофе", "Молоко", "Лед"], allergens: ["Лактоза"], price: 35, image: "https://picsum.photos/seed/icelatte/600/600", rating: 4.8, time: "5 мин" },
  { id: "ic4", name: "Гляссе", category: "ice-coffee", description: "Кофе с шариком мороженого.", ingredients: ["Кофе", "Мороженое"], allergens: ["Лактоза"], price: 25, image: "https://picsum.photos/seed/glace/600/600", rating: 4.9, time: "5 мин" },
  { id: "ic5", name: "Фрапучино", category: "ice-coffee", description: "Густой кофейный коктейль с крошкой льда.", ingredients: ["Кофе", "Молоко", "Лед", "Сироп"], allergens: ["Лактоза"], price: 35, image: "https://picsum.photos/seed/frap/600/600", rating: 4.9, time: "7 мин" },
  { id: "ic6", name: "Айс Раф", category: "ice-coffee", description: "Холодный раф со льдом.", ingredients: ["Кофе", "Сливки", "Лед", "Ваниль"], allergens: ["Лактоза"], price: 40, image: "https://picsum.photos/seed/iceraf/600/600", rating: 5.0, time: "6 мин" },

  // МОХИТО
  { id: "m1", name: "Мохито Классик", category: "mojito", description: "Лайм, мята, содовая.", ingredients: ["Лайм", "Мята", "Содовая"], allergens: [], price: 35, image: PlaceHolderImages.find(img => img.id === 'mojito')?.imageUrl || "", rating: 4.9, time: "5 мин" },
  { id: "m2", name: "Мохито Клубника", category: "mojito", description: "Клубника, лайм, мята.", ingredients: ["Клубника", "Лайм", "Мята", "Содовая"], allergens: [], price: 35, image: "https://picsum.photos/seed/strawberrym/600/600", rating: 4.8, time: "5 мин" },
  { id: "m3", name: "Мохито Океан", category: "mojito", description: "Тропический вкус и голубой цвет.", ingredients: ["Сироп Блю Кюрасао", "Лайм", "Мята"], allergens: [], price: 35, image: "https://picsum.photos/seed/oceanm/600/600", rating: 4.7, time: "5 мин" },

  // АЙС ТИ
  { id: "it1", name: "Айс Ти", category: "ice-tea", description: "Классический холодный чай.", ingredients: ["Чай", "Лимон", "Лед"], allergens: [], price: 35, image: "https://picsum.photos/seed/icetea/600/600", rating: 4.6, time: "3 мин" },

  // ЧАЙ
  { id: "t1", name: "Чай Манго Ананас", category: "tea", description: "Тропический фруктовый микс.", ingredients: ["Манго", "Ананас", "Чай"], allergens: [], price: 35, image: "https://picsum.photos/seed/mangotea/600/600", rating: 4.9, time: "5 мин" },
  { id: "t2", name: "Чай Апельсин Мята", category: "tea", description: "Цитрусовая свежесть.", ingredients: ["Апельсин", "Мята", "Чай"], allergens: [], price: 35, image: "https://picsum.photos/seed/orangetea/600/600", rating: 4.8, time: "5 мин" },
  { id: "t3", name: "Чай Фруктовый с Лимоном", category: "tea", description: "Насыщенный фруктовый вкус.", ingredients: ["Фрукты", "Лимон", "Чай"], allergens: [], price: 35, image: "https://picsum.photos/seed/fruittea/600/600", rating: 4.7, time: "5 мин" },
  { id: "t4", name: "Чай Имбирь", category: "tea", description: "Согревающий и полезный.", ingredients: ["Имбирь", "Лимон", "Мед", "Чай"], allergens: [], price: 35, image: "https://picsum.photos/seed/gingertea/600/600", rating: 4.9, time: "5 мин" },
  { id: "t5", name: "Чай Малина", category: "tea", description: "Сладкий ягодный вкус.", ingredients: ["Малина", "Чай"], allergens: [], price: 35, image: "https://picsum.photos/seed/raspbtea/600/600", rating: 4.8, time: "5 мин" },
  { id: "t6", name: "Чай Персик с Лимоном", category: "tea", description: "Нежный персик и кислинка лимона.", ingredients: ["Персик", "Лимон", "Чай"], allergens: [], price: 35, image: "https://picsum.photos/seed/peachtea/600/600", rating: 4.8, time: "5 мин" },
  { id: "t7", name: "Чай с лимоном", category: "tea", description: "Классический черный чай с лимоном.", ingredients: ["Черный чай", "Лимон"], allergens: [], price: 25, image: "https://picsum.photos/seed/lemontea/600/600", rating: 4.6, time: "3 мин" },
  { id: "t8", name: "Чай каркадэ с наватом", category: "tea", description: "Красный чай с традиционной сладостью.", ingredients: ["Каркадэ", "Нават"], allergens: [], price: 30, image: "https://picsum.photos/seed/hibiscus/600/600", rating: 4.7, time: "5 мин" },
  { id: "t9", name: "Чай чёрный", category: "tea", description: "Крепкий черный чай.", ingredients: ["Черный чай"], allergens: [], price: 20, image: "https://picsum.photos/seed/blacktea/600/600", rating: 4.5, time: "3 мин" },
  { id: "t10", name: "Чай зелёный", category: "tea", description: "Полезный зеленый чай.", ingredients: ["Зеленый чай"], allergens: [], price: 20, image: "https://picsum.photos/seed/greentea/600/600", rating: 4.6, time: "3 мин" },
  { id: "t11", name: "Чай Кийик Ути", category: "tea", description: "Традиционный горный чай.", ingredients: ["Трава Кийик Ути"], allergens: [], price: 20, image: "https://picsum.photos/seed/herbaltea/600/600", rating: 4.9, time: "5 мин" },

  // МИЛКШЕЙК
  { id: "ms1", name: "Ванильный милкшейк", category: "milkshakes", description: "Классический ванильный вкус.", ingredients: ["Молоко", "Мороженое", "Ваниль"], allergens: ["Лактоза"], price: 30, image: "https://picsum.photos/seed/vanillams/600/600", rating: 4.8, time: "7 мин" },
  { id: "ms2", name: "Шоколадный милкшейк", category: "milkshakes", description: "Насыщенный шоколадный вкус.", ingredients: ["Молоко", "Мороженое", "Шоколад"], allergens: ["Лактоза"], price: 30, image: "https://picsum.photos/seed/chocms/600/600", rating: 4.9, time: "7 мин" },
  { id: "ms3", name: "Банановый милкшейк", category: "milkshakes", description: "Свежий банан и нежное молоко.", ingredients: ["Молоко", "Мороженое", "Банан"], allergens: ["Лактоза"], price: 35, image: "https://picsum.photos/seed/bananams/600/600", rating: 4.7, time: "7 мин" },
  { id: "ms4", name: "Клубничный милкшейк", category: "milkshakes", description: "Ягодный микс.", ingredients: ["Молоко", "Мороженое", "Клубника"], allergens: ["Лактоза"], price: 35, image: PlaceHolderImages.find(img => img.id === 'milkshake')?.imageUrl || "", rating: 4.8, time: "7 мин" },
  { id: "ms5", name: "Милкшейк Oreo", category: "milkshakes", description: "С кусочками печенья Oreo.", ingredients: ["Молоко", "Мороженое", "Oreo"], allergens: ["Лактоза", "Глютен"], price: 35, image: "https://picsum.photos/seed/oreoms/600/600", rating: 5.0, time: "8 мин" },
  { id: "ms6", name: "Милкшейк Вишня", category: "milkshakes", description: "Вишневая сладость с кислинкой.", ingredients: ["Молоко", "Мороженое", "Вишня"], allergens: ["Лактоза"], price: 35, image: "https://picsum.photos/seed/cherryms/600/600", rating: 4.8, time: "7 мин" },

  // МОХИТО (ГРАФИН)
  { id: "mg1", name: "Классический (1л)", category: "mojito-carafe", description: "Большой объем для компании.", ingredients: ["Лайм", "Мята", "Содовая"], allergens: [], price: 45, image: "https://picsum.photos/seed/classiccarafe/600/600", rating: 4.9, time: "10 мин" },
  { id: "mg2", name: "Клубничный (1л)", category: "mojito-carafe", description: "Сладкий ягодный графин.", ingredients: ["Клубника", "Лайм", "Мята", "Содовая"], allergens: [], price: 50, image: "https://picsum.photos/seed/strawcarafe/600/600", rating: 4.8, time: "10 мин" },
  { id: "mg3", name: "Апельсиновый (1л)", category: "mojito-carafe", description: "Цитрусовый заряд.", ingredients: ["Апельсин", "Лайм", "Мята", "Содовая"], allergens: [], price: 50, image: "https://picsum.photos/seed/orangecarafe/600/600", rating: 4.7, time: "10 мин" },
  { id: "mg4", name: "Киви (1л)", category: "mojito-carafe", description: "Экзотический вкус киви.", ingredients: ["Киви", "Лайм", "Мята", "Содовая"], allergens: [], price: 50, image: "https://picsum.photos/seed/kiwicarafe/600/600", rating: 4.8, time: "10 мин" },

  // МОРОЖЕНОЕ
  { id: "icr1", name: "Ванильное", category: "ice-cream", description: "Классический пломбир.", ingredients: ["Сливки", "Ваниль"], allergens: ["Лактоза"], price: 20, image: PlaceHolderImages.find(img => img.id === 'ice-cream')?.imageUrl || "", rating: 4.8, time: "3 мин" },
  { id: "icr2", name: "Шоколадное", category: "ice-cream", description: "Насыщенный шоколадный пломбир.", ingredients: ["Сливки", "Какао"], allergens: ["Лактоза"], price: 20, image: "https://picsum.photos/seed/chocic/600/600", rating: 4.9, time: "3 мин" },
  { id: "icr3", name: "Клубничное", category: "ice-cream", description: "С нежным вкусом клубники.", ingredients: ["Сливки", "Клубника"], allergens: ["Лактоза"], price: 25, image: "https://picsum.photos/seed/strawic/600/600", rating: 4.7, time: "3 мин" },
  { id: "icr4", name: "Банановое", category: "ice-cream", description: "Спелый банан в мороженом.", ingredients: ["Сливки", "Банан"], allergens: ["Лактоза"], price: 25, image: "https://picsum.photos/seed/bananaic/600/600", rating: 4.8, time: "3 мин" },
  { id: "icr5", name: "Мороженое Oreo", category: "ice-cream", description: "С хрустящим печеньем Oreo.", ingredients: ["Сливки", "Oreo"], allergens: ["Лактоза", "Глютен"], price: 30, image: "https://picsum.photos/seed/oreoic/600/600", rating: 5.0, time: "4 мин" },
];

const CATEGORIES = [
  { id: "coffee", name: "Кофе" },
  { id: "ice-coffee", name: "Айс Кофе" },
  { id: "mojito", name: "Мохито" },
  { id: "ice-tea", name: "АйсТи" },
  { id: "tea", name: "Чай" },
  { id: "milkshakes", name: "Милкшейки" },
  { id: "mojito-carafe", name: "Мохито (Графин)" },
  { id: "ice-cream", name: "Мороженое" },
];

export function Menu() {
  const { searchQuery } = useCart();

  const applyFilters = (items: MenuItem[]) => {
    return items.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || 
               item.ingredients.some(i => i.toLowerCase().includes(q));
      }
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
                <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-1">
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
