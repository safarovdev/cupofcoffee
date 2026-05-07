"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem } from "@/components/Menu";

export type CartItem = {
  cartId: string;
  item: MenuItem;
  size?: string;
  milk?: string;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, size?: string, milk?: string) => void;
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

  const addToCart = (item: MenuItem, size?: string, milk?: string) => {
    const cartId = `${item.id}-${size || ""}-${milk || ""}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { cartId, item, size, milk, quantity: 1 }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.cartId === cartId) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

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
