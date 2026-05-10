
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to consolidated cart page
    router.replace('/cart');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-primary font-black uppercase tracking-widest">
        Загрузка...
      </div>
    </div>
  );
}
