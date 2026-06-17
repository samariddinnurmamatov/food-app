// Live order-tracking timeline (DEMO / mock).
//
// The status of an in-progress order is derived purely from the seconds elapsed
// since `order.createdAt`, on an ACCELERATED demo timeline so the whole flow is
// visible while watching (~2.5 min end to end). In a real app these thresholds
// come from the backend (per-restaurant prep time, live courier GPS, etc.) — the
// page would subscribe to those instead of computing locally.

import type { Order } from "@/types";

export type LiveStatus = "pending" | "preparing" | "on_the_way" | "delivered";

// Seconds-from-createdAt thresholds at which each phase BEGINS.
// 0–20s pending · 20–60s preparing · 60–150s on_the_way · >150s delivered
export const PHASE_PENDING_END = 20;
export const PHASE_PREPARING_END = 60;
export const PHASE_ON_THE_WAY_END = 150; // delivered after this

// Stored statuses that are final — never simulated, no countdown.
export function isFinalStatus(status: Order["status"]): boolean {
  return status === "delivered" || status === "cancelled";
}

export interface OrderProgress {
  /** Current live phase of the order. */
  status: LiveStatus;
  /** 0..3 index into the 4-step timeline (pending→preparing→on_the_way→delivered). */
  stepIndex: number;
  /** Whether the order has reached the delivered state. */
  delivered: boolean;
  /** Seconds remaining until delivered (0 once delivered). */
  remainingSeconds: number;
  /** 0..1 fraction of the on_the_way leg completed (0 before, 1 once delivered). */
  courierProgress: number;
}

const STEP_INDEX: Record<LiveStatus, number> = {
  pending: 0,
  preparing: 1,
  on_the_way: 2,
  delivered: 3,
};

/**
 * Compute the live progress of an order at time `now` (ms epoch).
 *
 * - A stored delivered/cancelled order is shown in its final state (no countdown,
 *   courier parked at the destination).
 * - An old `on_the_way` seed order whose createdAt is far in the past would, on the
 *   raw timeline, read as "delivered". To keep such an order looking active near
 *   arrival (rather than jumping oddly), we clamp it to the tail of the on_the_way
 *   leg: ~95% of the route, ~30s ETA. Freshly placed orders advance naturally.
 */
export function computeOrderProgress(order: Order, now: number): OrderProgress {
  if (isFinalStatus(order.status)) {
    return {
      status: "delivered",
      stepIndex: order.status === "delivered" ? 3 : 0,
      delivered: order.status === "delivered",
      remainingSeconds: 0,
      courierProgress: order.status === "delivered" ? 1 : 0,
    };
  }

  const elapsed = (now - new Date(order.createdAt).getTime()) / 1000;

  // Graceful handling of an old active (on_the_way) seed order: pin it near
  // arrival instead of letting the elapsed time tip it into "delivered".
  if (order.status === "on_the_way" && elapsed >= PHASE_ON_THE_WAY_END) {
    return {
      status: "on_the_way",
      stepIndex: STEP_INDEX.on_the_way,
      delivered: false,
      remainingSeconds: 30,
      courierProgress: 0.95,
    };
  }

  let status: LiveStatus;
  let courierProgress: number;
  if (elapsed < PHASE_PENDING_END) {
    status = "pending";
    courierProgress = 0;
  } else if (elapsed < PHASE_PREPARING_END) {
    status = "preparing";
    courierProgress = 0;
  } else if (elapsed < PHASE_ON_THE_WAY_END) {
    status = "on_the_way";
    const legElapsed = elapsed - PHASE_PREPARING_END;
    const legLength = PHASE_ON_THE_WAY_END - PHASE_PREPARING_END;
    courierProgress = Math.min(1, Math.max(0, legElapsed / legLength));
  } else {
    status = "delivered";
    courierProgress = 1;
  }

  const remainingSeconds = Math.max(0, Math.round(PHASE_ON_THE_WAY_END - elapsed));

  return {
    status,
    stepIndex: STEP_INDEX[status],
    delivered: status === "delivered",
    remainingSeconds,
    courierProgress,
  };
}
