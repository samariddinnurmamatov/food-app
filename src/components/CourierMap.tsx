"use client";

// SSR-safe wrapper around the real Leaflet map. Leaflet touches `window`, so the
// actual map (CourierMapInner) is loaded ONLY on the client via next/dynamic with
// ssr:false — it never runs on the server. Public API + props are unchanged from
// the previous fake map, so the order-tracking page needs no edits.

import dynamic from "next/dynamic";

interface CourierMapProps {
  /** 0..1 — how far along the route the courier is. */
  progress: number;
  mapTitle: string;
}

const CourierMapInner = dynamic(() => import("./CourierMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="h-60 w-full rounded-2xl overflow-hidden border border-border bg-secondary animate-pulse"
      aria-hidden="true"
    />
  ),
});

export function CourierMap({ progress, mapTitle }: CourierMapProps) {
  return <CourierMapInner progress={progress} mapTitle={mapTitle} />;
}
