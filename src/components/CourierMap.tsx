"use client";

// SSR-safe wrapper around the real Leaflet map. Leaflet touches `window`, so the
// actual map (CourierMapInner) is loaded ONLY on the client via next/dynamic with
// ssr:false — it never runs on the server. Public API + props are unchanged from
// the previous fake map, so the order-tracking page needs no edits.

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

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

// Isolate the Leaflet map: if it (or its lazily-loaded chunk) fails for ANY reason
// — a stale chunk after a redeploy, blocked tiles/OSRM, a Leaflet init error — the
// rest of the tracking page keeps working instead of crashing to the route-level
// error boundary. The page still shows the order status, courier and ETA.
class MapErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function CourierMap({ progress, mapTitle }: CourierMapProps) {
  return (
    <MapErrorBoundary
      fallback={
        <div
          role="img"
          aria-label={mapTitle}
          className="h-60 w-full rounded-2xl overflow-hidden border border-border bg-secondary flex items-center justify-center"
        >
          <span className="text-4xl opacity-60" aria-hidden="true">
            🗺️
          </span>
        </div>
      }
    >
      <CourierMapInner progress={progress} mapTitle={mapTitle} />
    </MapErrorBoundary>
  );
}
