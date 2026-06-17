"use client";
import { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { playNotificationSound } from "@/shared/lib/notificationSound";

const STORAGE_KEY = "notifications_v1";

// Notification "kind" — drives both the icon shown on the page and the semantic
// grouping. The visible COPY lives in i18n (Notifications namespace): each
// notification carries a titleKey/bodyKey (+ optional params for interpolation,
// e.g. the restaurant name) and a timeKey (a relative-time string key). This
// keeps all user-facing text translated in uz/ru/en while the stored data is
// locale-agnostic.
export type NotificationType = "order" | "promo" | "restaurant";

export interface AppNotification {
  id: string;
  type: NotificationType;
  titleKey: string;
  bodyKey: string;
  /** Interpolation values for titleKey/bodyKey (e.g. { restaurant: "Evos" }). */
  params?: Record<string, string>;
  /** Relative-time translation key (e.g. "timeNow", "timeJustNow"). */
  timeKey: string;
  read: boolean;
}

// Seed feed — mirrors the 4 inline notifications the page used to hardcode, now
// expressed as i18n keys. First two are unread so the bell badge starts at 2.
const SEED: AppNotification[] = [
  {
    id: "n1",
    type: "order",
    titleKey: "seedOnTheWayTitle",
    bodyKey: "seedOnTheWayBody",
    params: { restaurant: "Bellissimo Pizza" },
    timeKey: "time5min",
    read: false,
  },
  {
    id: "n2",
    type: "promo",
    titleKey: "seedPromoTitle",
    bodyKey: "seedPromoBody",
    timeKey: "time2hours",
    read: false,
  },
  {
    id: "n3",
    type: "restaurant",
    titleKey: "seedNewRestaurantTitle",
    bodyKey: "seedNewRestaurantBody",
    params: { restaurant: "Sushi Bar" },
    timeKey: "timeYesterday",
    read: true,
  },
  {
    id: "n4",
    type: "order",
    titleKey: "seedDeliveredTitle",
    bodyKey: "seedDeliveredBody",
    params: { restaurant: "Evos" },
    timeKey: "time2days",
    read: true,
  },
];

type NotificationInput = {
  type: NotificationType;
  titleKey: string;
  bodyKey: string;
  params?: Record<string, string>;
  timeKey?: string;
};

interface State {
  notifications: AppNotification[];
}

type Action =
  | { type: "HYDRATE"; notifications: AppNotification[] }
  | { type: "ADD"; notification: AppNotification }
  | { type: "MARK_ALL_READ" }
  | { type: "MARK_READ"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { notifications: action.notifications };
    case "ADD":
      return { notifications: [action.notification, ...state.notifications] };
    case "MARK_ALL_READ":
      return { notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "MARK_READ":
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    default:
      return state;
  }
}

const NotificationsContext = createContext<{
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (input: NotificationInput) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
} | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate on mount; seed the first time so the demo feed isn't empty. Only a
  // NON-EMPTY saved list counts as real state (a stale "[]" re-seeds).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      dispatch({
        type: "HYDRATE",
        notifications: Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED,
      });
    } catch {
      dispatch({ type: "HYDRATE", notifications: SEED });
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist ONLY after hydration — the initial empty state must never overwrite
  // saved notifications (persist-before-hydrate race, amplified by StrictMode).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notifications));
    } catch {}
  }, [state.notifications, hydrated]);

  const addNotification = useCallback((input: NotificationInput) => {
    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      type: input.type,
      titleKey: input.titleKey,
      bodyKey: input.bodyKey,
      params: input.params,
      timeKey: input.timeKey ?? "timeJustNow",
      read: false,
    };
    dispatch({ type: "ADD", notification });
    // Audio fires from a user gesture (order placed / status crossing during an
    // active session), so the autoplay policy lets it through. Never on load.
    playNotificationSound();
  }, []);

  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);
  const markRead = useCallback((id: string) => dispatch({ type: "MARK_READ", id }), []);

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  );

  const value = useMemo(
    () => ({
      notifications: state.notifications,
      unreadCount,
      addNotification,
      markAllRead,
      markRead,
    }),
    [state.notifications, unreadCount, addNotification, markAllRead, markRead]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
