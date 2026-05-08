import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Menu />
      </main>
    </div>
  );
}
