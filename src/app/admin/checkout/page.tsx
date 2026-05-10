
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCheckoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect duplicate checkout to cart
    router.replace('/admin/cart');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-primary font-black uppercase tracking-widest">
        Загрузка...
      </div>
    </div>
  );
}
