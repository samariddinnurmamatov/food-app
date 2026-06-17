"use client";
import { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { Order } from "@/types";
import { orders as seedOrders } from "@/mock/data";

const STORAGE_KEY = "orders_v1";

interface OrdersState {
  orders: Order[];
}

type OrderInput = Omit<Order, "id" | "status" | "createdAt"> & {
  status?: Order["status"];
};

type Action =
  | { type: "HYDRATE"; orders: Order[] }
  | { type: "ADD"; order: Order };

function reducer(state: OrdersState, action: Action): OrdersState {
  switch (action.type) {
    case "HYDRATE":
      return { orders: action.orders };
    case "ADD":
      return { orders: [action.order, ...state.orders] };
    default:
      return state;
  }
}

const OrdersContext = createContext<{
  orders: Order[];
  addOrder: (input: OrderInput) => Order;
  getOrderById: (id: string) => Order | undefined;
} | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { orders: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate on mount; seed with mock orders the first time so demo history exists.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      // Only treat a NON-EMPTY saved list as real state; an empty/invalid payload
      // (incl. a stale "[]") re-seeds so demo history is never blank.
      dispatch({ type: "HYDRATE", orders: Array.isArray(parsed) && parsed.length > 0 ? parsed : seedOrders });
    } catch {
      dispatch({ type: "HYDRATE", orders: seedOrders });
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist ONLY after hydration, so the initial empty state can never overwrite
  // saved data (which the persist-before-hydrate race — amplified by StrictMode's
  // double-mount — otherwise does, wiping placed orders).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.orders));
    } catch {}
  }, [state.orders, hydrated]);

  const addOrder = useCallback((input: OrderInput): Order => {
    const order: Order = {
      ...input,
      id: `order-${Date.now()}`,
      status: input.status ?? "pending",
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD", order });
    return order;
  }, []);

  const getOrderById = useCallback(
    (id: string) => state.orders.find((o) => o.id === id),
    [state.orders]
  );

  const value = useMemo(
    () => ({ orders: state.orders, addOrder, getOrderById }),
    [state.orders, addOrder, getOrderById]
  );

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
