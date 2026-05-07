import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Menu />
      </main>
      <footer className="border-t py-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} AromaFlow Cafe. Freshness in every cup.</p>
      </footer>
    </div>
  );
}