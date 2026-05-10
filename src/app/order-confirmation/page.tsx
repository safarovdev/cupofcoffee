'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  useEffect(() => {
    // Здесь можно добавить логику для отслеживания статуса заказа
    const checkOrderStatus = async () => {
      // В будущем здесь будет проверка статуса заказа
    };

    // Проверяем статус каждые 10 секунд
    const interval = setInterval(checkOrderStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в меню
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                Заказ принят!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Ваш заказ успешно оформлен и ожидает подтверждения от официанта.
              </p>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Ожидайте подтверждения заказа...</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Официант примет ваш заказ в ближайшее время</p>
                <p>• Вы можете отследить статус заказа на этой странице</p>
                <p>• При необходимости можно позвонить в кофейню</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/">
                  <Button variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Сделать новый заказ
                  </Button>
                </Link>
                <Link href="/track-order">
                  <Button className="flex-1">
                    Отследить заказ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
