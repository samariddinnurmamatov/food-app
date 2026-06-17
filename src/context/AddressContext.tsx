"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";

export interface Address {
  id: string;
  type: "home" | "work" | "other";
  label: string;
  address: string;
  detail?: string;
  isDefault: boolean;
}

const STORAGE_KEY = "addresses_v1";

const SEED: Address[] = [
  { id: "1", type: "home", label: "Uy", address: "Chilonzor 12-kvartal, 5-uy", detail: "Toshkent", isDefault: true },
  { id: "2", type: "work", label: "Ish", address: "Amir Temur ko'chasi, 107-bino", detail: "Toshkent", isDefault: false },
];

type NewAddress = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

const AddressContext = createContext<{
  addresses: Address[];
  defaultAddress: Address | undefined;
  addAddress: (input: NewAddress) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
} | null>(null);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate on mount; seed the first time so the demo has saved addresses.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      // Only a NON-EMPTY saved list counts as real state; empty/invalid (incl. a
      // stale "[]") re-seeds so checkout always has a default address.
      setAddresses(Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED);
    } catch {
      setAddresses(SEED);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist ONLY after hydration — the initial empty state must never overwrite
  // saved addresses (the persist-before-hydrate race, amplified by StrictMode).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch {}
  }, [addresses, hydrated]);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const addAddress = useCallback((input: NewAddress) =>
    setAddresses((prev) => [
      ...prev,
      { ...input, id: Date.now().toString(), isDefault: input.isDefault ?? prev.length === 0 },
    ]), []);

  const removeAddress = useCallback((id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id)), []);

  const setDefault = useCallback((id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id }))), []);

  const value = useMemo(
    () => ({ addresses, defaultAddress, addAddress, removeAddress, setDefault }),
    [addresses, defaultAddress, addAddress, removeAddress, setDefault]
  );

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used inside AddressProvider");
  return ctx;
}
