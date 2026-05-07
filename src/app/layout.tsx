import type {Metadata} from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Cup Of Coffee - Идеальный кофе для вас',
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
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
