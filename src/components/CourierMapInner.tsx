"use client";

// Real interactive Leaflet map for order tracking.
//
// - OpenStreetMap (or CartoDB dark) raster tiles, no API key.
// - A REAL driving route fetched from the public OSRM server that follows actual
//   roads, drawn as a brand-red polyline (falls back to a straight line offline).
// - A courier marker (scooter glyph) that glides ALONG the real road geometry as
//   `progress` (0..1) advances, eased between the parent's ~1s ticks via rAF — so
//   it looks like a vehicle actually driving to the destination.
//
// SSR-safe: this module is only ever loaded client-side (via next/dynamic with
// ssr:false from CourierMap.tsx) so the top-level `leaflet` import never runs on
// the server. We still guard window access and clean up the map on unmount.

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Brand red (matches --primary in globals.css). Leaflet draws to canvas/SVG with
// real color strings, so we can't hand it the CSS var directly.
const BRAND = "#EF4444";

// Restaurant ORIGIN and delivery DESTINATION as real Tashkent coordinates,
// ~7 km apart on real roads. The destination is hard-coded for the demo; in a
// real app it would come from the saved delivery address / backend geocoding of
// `order.address`, and the origin from the restaurant's stored location.
const ORIGIN: L.LatLngTuple = [41.3111, 69.2797]; // ~Amir Temur / city center
const DEST: L.LatLngTuple = [41.2847, 69.2041]; // ~Chilonzor

type LngLat = [number, number]; // OSRM/GeoJSON order: [lng, lat]

interface CourierMapInnerProps {
  /** 0..1 — how far along the route the courier is. */
  progress: number;
  mapTitle: string;
}

/** Haversine distance in metres between two [lat,lng] points. */
function distanceMeters(a: L.LatLngTuple, b: L.LatLngTuple): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Build a sampler over a decoded route (array of [lat,lng]) that returns the
 * interpolated point at fraction `p` (0..1) of the total road length, weighting
 * by segment length so movement is even along the whole route.
 */
function makeRouteSampler(points: L.LatLngTuple[]) {
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + distanceMeters(points[i - 1], points[i]));
  }
  const total = cum[cum.length - 1] || 1;

  function pointAtFraction(p: number): L.LatLngTuple {
    const clamped = Math.min(1, Math.max(0, p));
    if (points.length === 1) return points[0];
    const target = clamped * total;
    // Find the segment containing `target`.
    for (let i = 1; i < cum.length; i++) {
      if (target <= cum[i] || i === cum.length - 1) {
        const segLen = cum[i] - cum[i - 1];
        const f = segLen === 0 ? 0 : (target - cum[i - 1]) / segLen;
        const a = points[i - 1];
        const b = points[i];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      }
    }
    return points[points.length - 1];
  }

  return { pointAtFraction, total };
}

/** Bearing (deg, 0 = north) from point a to b — used to rotate the scooter glyph. */
function bearing(a: L.LatLngTuple, b: L.LatLngTuple): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function destinationIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-100%);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="${BRAND}" stroke="#fff" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
      </svg>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function restaurantIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:${BRAND};border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function courierIcon(headingDeg: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-50%)">
      <div style="width:34px;height:34px;border-radius:50%;background:${BRAND};display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.45);border:2px solid #fff">
        <span style="display:inline-block;font-size:18px;line-height:1;transform:rotate(${headingDeg}deg)">🛵</span>
      </div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function CourierMapInner({ progress, mapTitle }: CourierMapInnerProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistent Leaflet objects (survive re-renders; cleaned up on unmount).
  const mapRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const samplerRef = useRef<ReturnType<typeof makeRouteSampler> | null>(null);

  // Animation state for easing the courier between ticks.
  const rafRef = useRef<number | null>(null);
  const animFromRef = useRef<L.LatLngTuple | null>(null);
  const animToRef = useRef<L.LatLngTuple | null>(null);
  const animStartRef = useRef<number>(0);
  const headingRef = useRef<number>(0);

  // ---- Initialise the map ONCE (guard against React StrictMode double-init). ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return; // already initialised
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false, // avoid hijacking page scroll inside the mini-app
    });
    mapRef.current = map;

    // Initial view: fit the straight origin→dest extent until the real route loads.
    map.fitBounds(L.latLngBounds([ORIGIN, DEST]), { padding: [30, 30] });

    // Tile layer (theme-aware; updated in a separate effect on theme change).
    tileLayerRef.current = makeTileLayer(resolvedTheme).addTo(map);

    // Static markers: restaurant origin + destination pin.
    L.marker(ORIGIN, { icon: restaurantIcon(), interactive: false }).addTo(map);
    L.marker(DEST, { icon: destinationIcon(), interactive: false }).addTo(map);

    // Courier marker starts at the origin.
    courierMarkerRef.current = L.marker(ORIGIN, {
      icon: courierIcon(0),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map);

    // Seed a straight-line sampler so the courier can move even before OSRM
    // responds (or if it fails entirely).
    samplerRef.current = makeRouteSampler([ORIGIN, DEST]);
    let straightLine: L.Polyline | null = L.polyline([ORIGIN, DEST], {
      color: BRAND,
      weight: 4,
      opacity: 0.5,
      dashArray: "6 8",
    }).addTo(map);

    // ---- Fetch the REAL driving route from OSRM and replace the fallback line. ----
    const controller = new AbortController();
    (async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${ORIGIN[1]},${ORIGIN[0]};${DEST[1]},${DEST[0]}` +
          `?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`OSRM ${res.status}`);
        const data: { routes?: { geometry?: { coordinates?: LngLat[] } }[] } =
          await res.json();
        const coords = data.routes?.[0]?.geometry?.coordinates;
        if (!coords || coords.length < 2) throw new Error("no route geometry");

        // GeoJSON is [lng,lat] → Leaflet wants [lat,lng].
        const latlngs: L.LatLngTuple[] = coords.map(([lng, lat]) => [lat, lng]);

        if (!mapRef.current) return; // unmounted while fetching
        if (straightLine) {
          straightLine.remove();
          straightLine = null;
        }
        // Casing + brand line for a clean "navigation" look.
        L.polyline(latlngs, { color: "#ffffff", weight: 7, opacity: 0.9 }).addTo(map);
        L.polyline(latlngs, { color: BRAND, weight: 4, opacity: 1 }).addTo(map);

        samplerRef.current = makeRouteSampler(latlngs);
        map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });

        // Re-place the courier on the real geometry for the current progress.
        placeCourierImmediate(progressRef.current);
      } catch {
        // Offline / rate-limited: keep the straight-line fallback already drawn.
      }
    })();

    // Leaflet sometimes needs a nudge once its container has real dimensions.
    const sizeTimer = window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      controller.abort();
      window.clearTimeout(sizeTimer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      map.remove();
      mapRef.current = null;
      courierMarkerRef.current = null;
      tileLayerRef.current = null;
      samplerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Swap tiles when the app theme changes. ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();
    tileLayerRef.current = makeTileLayer(resolvedTheme).addTo(map);
  }, [resolvedTheme]);

  // Keep latest progress readable inside the async OSRM callback / rAF.
  const progressRef = useRef(progress);
  progressRef.current = progress;

  /** Snap the courier straight to the point for fraction p (no animation). */
  function placeCourierImmediate(p: number) {
    const sampler = samplerRef.current;
    const marker = courierMarkerRef.current;
    if (!sampler || !marker) return;
    const pt = sampler.pointAtFraction(p);
    marker.setLatLng(pt);
  }

  // ---- Animate the courier toward the new target whenever `progress` ticks. ----
  useEffect(() => {
    const map = mapRef.current;
    const sampler = samplerRef.current;
    const marker = courierMarkerRef.current;
    if (!map || !sampler || !marker) return;

    const target = sampler.pointAtFraction(progress);
    const from = (marker.getLatLng
      ? ([marker.getLatLng().lat, marker.getLatLng().lng] as L.LatLngTuple)
      : target) as L.LatLngTuple;

    // Update heading toward travel direction (look-ahead a hair down the route).
    const ahead = sampler.pointAtFraction(Math.min(1, progress + 0.02));
    if (distanceMeters(from, ahead) > 1) {
      headingRef.current = bearing(from, ahead);
      marker.setIcon(courierIcon(headingRef.current));
    }

    animFromRef.current = from;
    animToRef.current = target;
    animStartRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    // Glide from `from` to `target` over ~1s (the parent tick interval) with an
    // ease-out so the scooter accelerates then settles — like real driving.
    const DURATION = 900;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (ts: number) => {
      const f = animFromRef.current;
      const to = animToRef.current;
      if (!f || !to || !courierMarkerRef.current || !mapRef.current) return;
      const elapsed = ts - animStartRef.current;
      const k = Math.min(1, elapsed / DURATION);
      const e = easeOut(k);
      const lat = f[0] + (to[0] - f[0]) * e;
      const lng = f[1] + (to[1] - f[1]) * e;
      courierMarkerRef.current.setLatLng([lat, lng]);
      // Soft follow: gently keep the courier in view without fighting the user.
      mapRef.current.panTo([lat, lng], { animate: true, duration: 0.5, noMoveStart: true });
      if (k < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [progress]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={mapTitle}
      className="h-60 w-full rounded-2xl overflow-hidden border border-border bg-secondary z-0"
    />
  );
}

/** Theme-aware tile layer: CartoDB dark for dark mode, standard OSM otherwise. */
function makeTileLayer(theme: string | undefined): L.TileLayer {
  if (theme === "dark") {
    return L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      },
    );
  }
  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  });
}
