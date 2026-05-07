import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Menu />
      </main>
      <footer className="border-t py-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Cup Of Coffee. С любовью к каждой чашке.</p>
      </footer>
    </div>
  );
}