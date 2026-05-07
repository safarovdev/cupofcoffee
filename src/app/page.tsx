import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Menu />
      </main>
      <footer className="border-t py-12 text-center text-muted-foreground text-sm bg-white mt-12 mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold font-headline text-primary">Cup Of Coffee</h2>
            <div className="flex gap-6 text-sm font-bold">
              <a href="#" className="hover:text-primary transition-colors">О нас</a>
              <a href="#" className="hover:text-primary transition-colors">Доставка</a>
              <a href="#" className="hover:text-primary transition-colors">Контакты</a>
              <a href="#" className="hover:text-primary transition-colors">Правовая информация</a>
            </div>
          </div>
          <p className="opacity-60">© {new Date().getFullYear()} Cup Of Coffee. Сделано с любовью к кофе.</p>
        </div>
      </footer>
    </div>
  );
}
