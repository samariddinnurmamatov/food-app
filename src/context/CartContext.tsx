"use client";
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem, FoodItem } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  totalItems: number;
}

type Action =
  | { type: "ADD"; food: FoodItem; quantity: number }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function calcTotals(items: CartItem[]) {
  return items.reduce(
    (acc, i) => ({ totalItems: acc.totalItems + i.quantity, total: acc.total + i.food.price * i.quantity }),
    { totalItems: 0, total: 0 }
  );
}

function reducer(state: CartState, action: Action): CartState {
  let items: CartItem[];
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, ...calcTotals(action.items) };
    case "ADD": {
      const existing = state.items.find((i) => i.food.id === action.food.id);
      if (existing) {
        items = state.items.map((i) =>
          i.food.id === action.food.id ? { ...i, quantity: i.quantity + action.quantity } : i
        );
      } else {
        items = [...state.items, { food: action.food, quantity: action.quantity }];
      }
      break;
    }
    case "REMOVE":
      items = state.items.filter((i) => i.food.id !== action.id);
      break;
    case "UPDATE":
      if (action.quantity <= 0) {
        items = state.items.filter((i) => i.food.id !== action.id);
      } else {
        items = state.items.map((i) =>
          i.food.id === action.id ? { ...i, quantity: action.quantity } : i
        );
      }
      break;
    case "CLEAR":
      items = [];
      break;
    default:
      return state;
  }
  return { items, ...calcTotals(items) };
}

const CartContext = createContext<{
  items: CartItem[];
  total: number;
  totalItems: number;
  addItem: (food: FoodItem, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], total: 0, totalItems: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart_items");
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: "HYDRATE", items });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(state.items));
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total: state.total,
        totalItems: state.totalItems,
        addItem: (food, qty = 1) => dispatch({ type: "ADD", food, quantity: qty }),
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        updateQuantity: (id, quantity) => dispatch({ type: "UPDATE", id, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
