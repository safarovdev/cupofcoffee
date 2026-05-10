
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem } from "@/components/Menu";

export type CartItem = {
  cartId: string;
  item: MenuItem;
  size?: string;
  milk?: string;
  quantity: number;
  priceAtSelection: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, size?: string, milk?: string, price?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем корзину из localStorage при монтировании
  useEffect(() => {
    // Проверяем что мы на клиенте
    if (typeof window !== 'undefined') {
      try {
        console.log('Loading cart from localStorage...');
        const savedCart = localStorage.getItem('coffee-cart');
        console.log('Saved cart data:', savedCart);
        console.log('Available localStorage keys:', Object.keys(localStorage));
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Parsed cart:', parsedCart);
          console.log('Setting cart with', parsedCart.length, 'items');
          setCart(parsedCart);
          console.log('Cart loaded from localStorage with', parsedCart.length, 'items');
        } else {
          console.log('No saved cart found in localStorage');
          // Проверим все ключи localStorage
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              console.log('LocalStorage key:', key, 'value:', localStorage.getItem(key));
            }
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      console.log('Window is undefined, skipping localStorage load');
    }
    setIsInitialized(true);
  }, []);

  // Сохраняем корзину в localStorage при изменениях
  useEffect(() => {
    // Сохраняем только после инициализации, чтобы не перезаписывать данные при загрузке
    if (isInitialized && typeof window !== 'undefined') {
      try {
        console.log('Saving cart to localStorage...', cart.length, 'items');
        localStorage.setItem('coffee-cart', JSON.stringify(cart));
        console.log('Cart saved to localStorage');
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    } else if (!isInitialized) {
      console.log('Not saving cart - not initialized yet');
    } else {
      console.log('Window is undefined, skipping localStorage save');
    }
  }, [cart, isInitialized]);

  const addToCart = (item: MenuItem, size?: string, milk?: string, price?: number) => {
    const finalPrice = price || item.price;
    const cartId = `${item.id}-${size || "default"}-${milk || "none"}`;
    
    console.log('Adding to cart:', item.name, 'size:', size, 'milk:', milk, 'price:', finalPrice);
    
    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        console.log('Item exists in cart, increasing quantity');
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      console.log('Adding new item to cart');
      return [...prev, { cartId, item, size, milk, quantity: 1, priceAtSelection: finalPrice }];
    });
  };

  const removeFromCart = (cartId: string) => {
    console.log('Removing from cart:', cartId);
    setCart((prev) => {
      const newCart = prev.filter((i) => i.cartId !== cartId);
      console.log('Cart after removal:', newCart.length, 'items');
      return newCart;
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    console.log('Updating quantity:', cartId, 'delta:', delta);
    setCart((prev) =>
      prev.map((i) => {
        if (i.cartId === cartId) {
          const newQty = Math.max(1, i.quantity + delta);
          console.log('New quantity for', cartId, ':', newQty);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cart.reduce((acc, curr) => acc + curr.priceAtSelection * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
