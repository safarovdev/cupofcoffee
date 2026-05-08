
"use client";

import { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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
  rating: number;
  time: string;
  sizes?: { [key: string]: number };
};

const MENU_DATA: MenuItem[] = [
  // КОФЕ
  { 
    id: "c1", 
    name: "Эспрессо", 
    category: "coffee", 
    description: "Классический крепкий кофе.", 
    ingredients: ["Кофе"], 
    allergens: [], 
    price: 15000, 
    sizes: { "Простой": 15000, "Двойной": 25000 },
    image: "https://picsum.photos/seed/espresso1/600/600", 
    rating: 4.9, 
    time: "3 мин" 
  },
  { 
    id: "c2", 
    name: "Американо", 
    category: "coffee", 
    description: "Эспрессо с горячей водой.", 
    ingredients: ["Кофе", "Вода"], 
    allergens: [], 
    price: 20000, 
    sizes: { "Простой": 20000, "Двойной": 30000 },
    image: "https://picsum.photos/seed/americano/600/600", 
    rating: 4.7, 
    time: "4 мин" 
  },
  { 
    id: "c3", 
    name: "Капучино", 
    category: "coffee", 
    description: "Кофе с молочной пенкой.", 
    ingredients: ["Кофе", "Молоко"], 
    allergens: ["Лактоза"], 
    price: 25000, 
    sizes: { "Простой": 25000, "Двойной": 35000 },
    image: "https://picsum.photos/seed/cappuccino/600/600", 
    rating: 4.8, 
    time: "5 мин" 
  },
  { 
    id: "c4", 
    name: "Латте", 
    category: "coffee", 
    description: "Мягкий кофейно-молочный напиток.", 
    ingredients: ["Кофе", "Молоко"], 
    allergens: ["Лактоза"], 
    price: 25000, 
    sizes: { "Простой": 25000, "Двойной": 35000 },
    image: PlaceHolderImages.find(img => img.id === 'latte')?.imageUrl || "", 
    rating: 4.8, 
    time: "5 мин" 
  },
  { id: "c5", name: "Флэт Уайт", category: "coffee", description: "Двойной эспрессо с тонким слоем пены.", ingredients: ["Кофе", "Молоко"], allergens: ["Лактоза"], price: 30000, image: "https://picsum.photos/seed/flatwhite/600/600", rating: 4.9, time: "5 мин" },
  { id: "c6", name: "Лунго", category: "coffee", description: "Кофе длительной экстракции.", ingredients: ["Кофе", "Вода"], allergens: [], price: 25000, image: "https://picsum.photos/seed/lungo/600/600", rating: 4.6, time: "4 мин" },
  { id: "c7", name: "Раф", category: "coffee", description: "Кофе со сливками и ванилью.", ingredients: ["Кофе", "Сливки", "Ванильный сахар"], allergens: ["Лактоза"], price: 35000, image: "https://picsum.photos/seed/raf/600/600", rating: 5.0, time: "6 мин" },
  { 
    id: "c8", 
    name: "Какао", 
    category: "coffee", 
    description: "Классический какао на молоке.", 
    ingredients: ["Какао-порошок", "Молоко"], 
    allergens: ["Лактоза"], 
    price: 20000, 
    sizes: { "Простой": 20000, "Двойной": 30000 },
    image: "https://picsum.photos/seed/cocoa/600/600", 
    rating: 4.8, 
    time: "5 мин" 
  },
  { 
    id: "c9", 
    name: "Горячий шоколад", 
    category: "coffee", 
    description: "Густой шоколадный десерт.", 
    ingredients: ["Шоколад", "Молоко"], 
    allergens: ["Лактоза"], 
    price: 25000, 
    sizes: { "Простой": 25000, "Двойной": 35000 },
    image: "https://picsum.photos/seed/hotchoc/600/600", 
    rating: 4.9, 
    time: "6 мин" 
  },

  // АЙС КОФЕ
  { id: "ic1", name: "Айс Американо", category: "ice-coffee", description: "Холодный кофе со льдом.", ingredients: ["Кофе", "Лед"], allergens: [], price: 25000, image: "https://picsum.photos/seed/iceam/600/600", rating: 4.7, time: "4 мин" },
  { id: "ic2", name: "Айс Капучино", category: "ice-coffee", description: "Освежающий капучино со льдом.", ingredients: ["Кофе", "Молоко", "Лед"], allergens: ["Лактоза"], price: 35000, image: "https://picsum.photos/seed/icecap/600/600", rating: 4.8, time: "5 мин" },
  { id: "ic3", name: "Айс Латте", category: "ice-coffee", description: "Холодный латте со льдом.", ingredients: ["Кофе", "Молоко", "Лед"], allergens: ["Лактоза"], price: 35000, image: "https://picsum.photos/seed/icelatte/600/600", rating: 4.8, time: "5 мин" },
  { 
    id: "ic4", 
    name: "Гляссе", 
    category: "ice-coffee", 
    description: "Кофе с мороженым.", 
    ingredients: ["Кофе", "Мороженое"], 
    allergens: ["Лактоза"], 
    price: 25000, 
    sizes: { "Простой": 25000, "Двойной": 35000 },
    image: "https://picsum.photos/seed/glace/600/600", 
    rating: 4.9, 
    time: "5 мин" 
  },
  { id: "ic5", name: "Фрапучино", category: "ice-coffee", description: "Кофейный шейк со льдом.", ingredients: ["Кофе", "Молоко", "Лед", "Сироп"], allergens: ["Лактоза"], price: 35000, image: "https://picsum.photos/seed/frap/600/600", rating: 4.9, time: "7 мин" },
  { id: "ic6", name: "Айс Раф", category: "ice-coffee", description: "Холодный раф со льдом.", ingredients: ["Кофе", "Сливки", "Лед", "Ваниль"], allergens: ["Лактоза"], price: 40000, image: "https://picsum.photos/seed/iceraf/600/600", rating: 5.0, time: "6 мин" },

  // МОХИТО
  { id: "m1", name: "Мохито Классик", category: "mojito", description: "Лайм, мята, содовая.", ingredients: ["Лайм", "Мята", "Содовая"], allergens: [], price: 35000, image: PlaceHolderImages.find(img => img.id === 'mojito')?.imageUrl || "", rating: 4.9, time: "5 мин" },
  { id: "m2", name: "Мохито Клубника", category: "mojito", description: "Клубника, лайм, мята.", ingredients: ["Клубника", "Лайм", "Мята", "Содовая"], allergens: [], price: 35000, image: "https://picsum.photos/seed/strawberrym/600/600", rating: 4.8, time: "5 мин" },
  { id: "m3", name: "Мохито Океан", category: "mojito", description: "Тропический голубой вкус.", ingredients: ["Сироп Блю Кюрасао", "Лайм", "Мята"], allergens: [], price: 35000, image: "https://picsum.photos/seed/oceanm/600/600", rating: 4.7, time: "5 мин" },

  // АЙС ТИ
  { id: "it1", name: "Айс Ти", category: "ice-tea", description: "Классический холодный чай.", ingredients: ["Чай", "Лимон", "Лед"], allergens: [], price: 35000, image: "https://picsum.photos/seed/icetea/600/600", rating: 4.6, time: "3 мин" },

  // ЧАЙ
  { id: "t1", name: "Чай Манго-Ананас", category: "tea", description: "Тропический фруктовый микс.", ingredients: ["Манго", "Ананас", "Чай"], allergens: [], price: 35000, image: "https://picsum.photos/seed/mangotea/600/600", rating: 4.9, time: "5 мин" },
  { id: "t2", name: "Чай Апельсин-Мята", category: "tea", description: "Цитрусовая свежесть.", ingredients: ["Апельсин", "Мята", "Чай"], allergens: [], price: 35000, image: "https://picsum.photos/seed/orangetea/600/600", rating: 4.8, time: "5 мин" },
  { id: "t3", name: "Чай Фруктовый с лимоном", category: "tea", description: "Насыщенный фруктовый вкус.", ingredients: ["Фрукты", "Лимон", "Чай"], allergens: [], price: 35000, image: "https://picsum.photos/seed/fruittea/600/600", rating: 4.7, time: "5 мин" },
  { id: "t4", name: "Чай Имбирный", category: "tea", description: "Согревающий имбирный чай.", ingredients: ["Имбирь", "Лимон", "Мед", "Чай"], allergens: [], price: 35000, image: "https://picsum.photos/seed/gingertea/600/600", rating: 4.9, time: "5 мин" },
  { id: "t5", name: "Чай Малиновый", category: "tea", description: "Сладкий ягодный вкус.", ingredients: ["Малина", "Чай"], allergens: [], price: 35000, image: "https://picsum.photos/seed/raspbtea/600/600", rating: 4.8, time: "5 мин" },
  { id: "t6", name: "Чай Персик с лимоном", category: "tea", description: "Нежный персик.", ingredients: ["Персик", "Лимон", "Чай"], allergens: [], price: 35000, image: "https://picsum.photos/seed/peachtea/600/600", rating: 4.8, time: "5 мин" },
  { id: "t7", name: "Чай с лимоном", category: "tea", description: "Классика с лимоном.", ingredients: ["Черный чай", "Лимон"], allergens: [], price: 25000, image: "https://picsum.photos/seed/lemontea/600/600", rating: 4.6, time: "3 мин" },
  { id: "t8", name: "Чай Каркаде с наватом", category: "tea", description: "Красный чай с наватом.", ingredients: ["Каркадэ", "Нават"], allergens: [], price: 30000, image: "https://picsum.photos/seed/hibiscus/600/600", rating: 4.7, time: "5 мин" },
  { id: "t9", name: "Чай чёрный", category: "tea", description: "Крепкий байховый чай.", ingredients: ["Черный чай"], allergens: [], price: 20000, image: "https://picsum.photos/seed/blacktea/600/600", rating: 4.5, time: "3 мин" },
  { id: "t10", name: "Чай зелёный", category: "tea", description: "Листовой зеленый чай.", ingredients: ["Зеленый чай"], allergens: [], price: 20000, image: "https://picsum.photos/seed/greentea/600/600", rating: 4.6, time: "3 мин" },
  { id: "t11", name: "Чай Кийик Ути", category: "tea", description: "Горные травы.", ingredients: ["Трава Кийик Ути"], allergens: [], price: 20000, image: "https://picsum.photos/seed/herbaltea/600/600", rating: 4.9, time: "5 мин" },

  // МИЛКШЕЙК
  { id: "ms1", name: "Милкшейк Ванильный", category: "milkshakes", description: "Нежная ваниль.", ingredients: ["Молоко", "Мороженое", "Ваниль"], allergens: ["Лактоза"], price: 30000, image: "https://picsum.photos/seed/vanillams/600/600", rating: 4.8, time: "7 мин" },
  { id: "ms2", name: "Милкшейк Шоколадный", category: "milkshakes", description: "Шоколадный взрыв.", ingredients: ["Молоко", "Мороженое", "Шоколад"], allergens: ["Лактоза"], price: 30000, image: "https://picsum.photos/seed/chocms/600/600", rating: 4.9, time: "7 мин" },
  { id: "ms3", name: "Милкшейк Банановый", category: "milkshakes", description: "Свежий банан.", ingredients: ["Молоко", "Мороженое", "Банан"], allergens: ["Лактоза"], price: 35000, image: "https://picsum.photos/seed/bananams/600/600", rating: 4.7, time: "7 мин" },
  { id: "ms4", name: "Милкшейк Клубничный", category: "milkshakes", description: "Ягодный шейк.", ingredients: ["Молоко", "Мороженое", "Клубника"], allergens: ["Лактоза"], price: 35000, image: PlaceHolderImages.find(img => img.id === 'milkshake')?.imageUrl || "", rating: 4.8, time: "7 мин" },
  { id: "ms5", name: "Милкшейк Oreo", category: "milkshakes", description: "С печеньем Oreo.", ingredients: ["Молоко", "Мороженое", "Oreo"], allergens: ["Лактоза", "Глютен"], price: 35000, image: "https://picsum.photos/seed/oreoms/600/600", rating: 5.0, time: "8 мин" },
  { id: "ms6", name: "Милкшейк Вишня", category: "milkshakes", description: "Вишневая сладость.", ingredients: ["Молоко", "Мороженое", "Вишня"], allergens: ["Лактоза"], price: 35000, image: "https://picsum.photos/seed/cherryms/600/600", rating: 4.8, time: "7 мин" },

  // МОХИТО (ГРАФИН)
  { 
    id: "mg1", 
    name: "Мохито Классический", 
    category: "mojito-carafe", 
    description: "Освежающий напиток с мятой, лаймом и льдом.", 
    ingredients: ["Лайм", "Мята", "Содовая"], 
    allergens: [], 
    price: 45000, 
    sizes: { "1 литр": 45000, "1.5 литра": 60000 },
    image: "https://picsum.photos/seed/classiccarafe/600/600", 
    rating: 4.9, 
    time: "10 мин" 
  },
  { 
    id: "mg2", 
    name: "Мохито Клубничный", 
    category: "mojito-carafe", 
    description: "Ягодная свежесть в большом объеме.", 
    ingredients: ["Клубника", "Лайм", "Мята", "Содовая"], 
    allergens: [], 
    price: 50000, 
    sizes: { "1 литр": 50000, "1.5 литра": 65000 },
    image: "https://picsum.photos/seed/strawcarafe/600/600", 
    rating: 4.8, 
    time: "10 мин" 
  },
  { 
    id: "mg3", 
    name: "Мохито Апельсиновый", 
    category: "mojito-carafe", 
    description: "Цитрусовый микс для всей компании.", 
    ingredients: ["Апельсин", "Лайм", "Мята", "Содовая"], 
    allergens: [], 
    price: 50000, 
    sizes: { "1 литр": 50000, "1.5 литра": 65000 },
    image: "https://picsum.photos/seed/orangecarafe/600/600", 
    rating: 4.7, 
    time: "10 мин" 
  },
  { 
    id: "mg4", 
    name: "Мохито Киви", 
    category: "mojito-carafe", 
    description: "Экзотический вкус в графине.", 
    ingredients: ["Киви", "Лайм", "Мята", "Содовая"], 
    allergens: [], 
    price: 50000, 
    sizes: { "1 литр": 50000, "1.5 литра": 65000 },
    image: "https://picsum.photos/seed/kiwicarafe/600/600", 
    rating: 4.8, 
    time: "10 мин" 
  },

  // МОРОЖЕНОЕ
  { id: "icr1", name: "Мороженое Ванильное", category: "ice-cream", description: "Классический пломбир.", ingredients: ["Сливки", "Ваниль"], allergens: ["Лактоза"], price: 20000, image: PlaceHolderImages.find(img => img.id === 'ice-cream')?.imageUrl || "", rating: 4.8, time: "3 мин" },
  { id: "icr2", name: "Мороженое Шоколадное", category: "ice-cream", description: "Насыщенный шоколад.", ingredients: ["Сливки", "Какао"], allergens: ["Лактоза"], price: 20000, image: "https://picsum.photos/seed/chocic/600/600", rating: 4.9, time: "3 мин" },
  { id: "icr3", name: "Мороженое Клубничное", category: "ice-cream", description: "С кусочками ягод.", ingredients: ["Сливки", "Клубника"], allergens: ["Лактоза"], price: 25000, image: "https://picsum.photos/seed/strawic/600/600", rating: 4.7, time: "3 мин" },
  { id: "icr4", name: "Мороженое Банановое", category: "ice-cream", description: "Натуральный банан.", ingredients: ["Сливки", "Банан"], allergens: ["Лактоза"], price: 25000, image: "https://picsum.photos/seed/bananaic/600/600", rating: 4.8, time: "3 мин" },
  { id: "icr5", name: "Мороженое Oreo", category: "ice-cream", description: "С печеньем Oreo.", ingredients: ["Сливки", "Oreo"], allergens: ["Лактоза", "Глютен"], price: 30000, image: "https://picsum.photos/seed/oreoic/600/600", rating: 5.0, time: "4 мин" },
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  if (activeCategory && !searchQuery) {
    const categoryName = CATEGORIES.find(c => c.id === activeCategory)?.name || "";
    const items = MENU_DATA.filter(i => i.category === activeCategory);

    return (
      <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 px-4 sm:px-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-muted/50"
            onClick={() => setActiveCategory(null)}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-3xl font-black font-headline text-primary uppercase tracking-tighter leading-none">
              {categoryName}
            </h2>
            <div className="h-1 w-12 bg-primary/20 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-1">
          {items.map((item) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-12">
      {searchQuery ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-1">
            {applyFilters(MENU_DATA).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {CATEGORIES.map((cat) => {
            const items = applyFilters(MENU_DATA.filter(i => i.category === cat.id));
            if (items.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-4 md:space-y-6">
                <div className="flex items-end justify-between px-4 sm:px-1">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tighter leading-none">
                      {cat.name}
                    </h2>
                    <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-primary/20 rounded-full" />
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground font-bold gap-1 hover:bg-muted/50 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-widest h-auto"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Смотреть все <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                <div className="relative overflow-visible">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar py-4 px-4 sm:px-1 scroll-smooth">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="w-[calc(100vw-64px)] sm:w-[320px] md:w-[340px] flex-shrink-0 snap-center"
                      >
                        <ProductCard item={item} />
                      </div>
                    ))}
                    <div className="min-w-[16px] sm:min-w-[24px] flex-shrink-0" />
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
