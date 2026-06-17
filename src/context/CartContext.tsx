"use client";
import { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { CartItem, FoodItem } from "@/types";
import { getFoodById } from "@/mock/data";

// Bumped from "cart_items" so any old-shape payload under the old key is ignored,
// not trusted, after the hydration reconciliation logic changed.
const STORAGE_KEY = "cart_items_v2";

// Reconcile a raw localStorage payload against live mock data:
// - drop malformed entries (missing food/id, non-positive quantity)
// - drop items whose food id no longer exists in the catalog
// - refresh the food snapshot (price/name/image/availability) from mock,
//   keeping only the stored quantity. This prevents stale prices / NaN totals.
function reconcile(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const result: CartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { food, quantity } = entry as { food?: { id?: unknown }; quantity?: unknown };
    const id = food?.id;
    if (typeof id !== "string") continue;
    const qty = typeof quantity === "number" && Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    if (qty <= 0) continue;
    const fresh = getFoodById(id);
    if (!fresh) continue; // unknown id → drop
    result.push({ food: fresh, quantity: qty });
  }
  return result;
}

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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items = reconcile(JSON.parse(saved));
        if (items.length > 0) {
          dispatch({ type: "HYDRATE", items });
        }
      }
    } catch {} finally {
      setHydrated(true);
    }
  }, []);

  // Persist only after hydration, so the empty initial state can't clobber a
  // saved cart before it's read (persist-before-hydrate race under StrictMode).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, hydrated]);

  // dispatch is stable, so these wrappers only need to be created once.
  const addItem = useCallback((food: FoodItem, qty = 1) => dispatch({ type: "ADD", food, quantity: qty }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
  const updateQuantity = useCallback((id: string, quantity: number) => dispatch({ type: "UPDATE", id, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo(
    () => ({
      items: state.items,
      total: state.total,
      totalItems: state.totalItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [state.items, state.total, state.totalItems, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
