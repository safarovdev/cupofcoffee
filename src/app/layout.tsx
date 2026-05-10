import type {Metadata} from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav } from '@/components/BottomNav';
import { AdminBottomNav } from '@/components/AdminBottomNav';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'cupofcoffee - Идеальный кофе для вас',
  description: 'Лучший кофе, чай и десерты в уютной атмосфере.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground">
        <FirebaseClientProvider>
          <CartProvider>
            {children}
            <BottomNav />
            <AdminBottomNav />
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
