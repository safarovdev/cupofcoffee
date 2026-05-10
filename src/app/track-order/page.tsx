
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackOrderPage() {
  const router = useRouter();

  useEffect(() => {
    // Страница отслеживания удалена по просьбе пользователя
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-primary font-black uppercase tracking-widest">
        Загрузка...
      </div>
    </div>
  );
}
