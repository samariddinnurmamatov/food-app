"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export interface AuthUser {
  name: string;
  phone: string;
}

// Persisted identity (name/phone edits made in Profile). In a Telegram Mini App
// the canonical identity comes from Telegram; this only holds local overrides.
const PROFILE_KEY = "user_profile";

// Default stub used outside Telegram (dev/browser) before any local edit.
const DEFAULT_USER: AuthUser = { name: "Foydalanuvchi", phone: "" };

// Minimal shape of the Telegram WebApp user we read on the client.
interface TelegramUser {
  first_name?: string;
  last_name?: string;
  username?: string;
}
interface TelegramWebApp {
  initDataUnsafe?: { user?: TelegramUser };
}
interface TelegramWindow {
  Telegram?: { WebApp?: TelegramWebApp };
}

const AuthContext = createContext<{
  user: AuthUser;
  updateUser: (partial: Partial<AuthUser>) => void;
} | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      if (p && typeof p.name === "string" && typeof p.phone === "string") {
        return { name: p.name, phone: p.phone };
      }
    }
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // The app ALWAYS has an identity — start from the stub, then refine on mount.
  const [user, setUser] = useState<AuthUser>(DEFAULT_USER);

  // Resolve identity on mount (SSR-safe: runs only on the client).
  useEffect(() => {
    // TODO(backend): replace this client-side read with backend-verified
    // initData (window.Telegram.WebApp.initData) once the backend is ready.
    const tg = (window as unknown as TelegramWindow)?.Telegram?.WebApp
      ?.initDataUnsafe?.user;
    if (tg) {
      const name =
        [tg.first_name, tg.last_name].filter(Boolean).join(" ") ||
        tg.username ||
        DEFAULT_USER.name;
      setUser({ name, phone: "" });
      return;
    }
    // Not inside Telegram (dev/browser): fall back to any saved local profile,
    // else keep the default stub.
    const stored = readStoredUser();
    if (stored) setUser(stored);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, updateUser }),
    [user, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
