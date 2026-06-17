"use client";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

// OpenStreetMap embed centered on Tashkent by default; recentred on the user's
// real coordinates once "use my location" resolves.
const TASHKENT_LAT = 41.3111;
const TASHKENT_LON = 69.2797;

// Build an embed URL centered on lat/lon with a marker. We derive a small bbox
// around the point (~±0.01°) so the embed zooms in on it.
function mapSrc(lat: number, lon: number): string {
  const d = 0.012;
  const bbox = `${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}`;
  const marker = `${lat}%2C${lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

interface LocationPickerProps {
  address: string;
  onAddressChange: (value: string) => void;
}

export function LocationPicker({ address, onAddressChange }: LocationPickerProps) {
  const t = useTranslations("Checkout");
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: TASHKENT_LAT,
    lon: TASHKENT_LON,
  });
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(false);

  const handleUseMyLocation = () => {
    setError(false);
    // SSR / unsupported guard — keep manual input usable.
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        // Reverse-geocode to a human address via OSM Nominatim; fall back to the
        // raw coordinates if the lookup fails or is rate-limited.
        let resolved = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            { headers: { Accept: "application/json" } }
          );
          if (res.ok) {
            const data: { display_name?: string } = await res.json();
            if (data.display_name) resolved = data.display_name;
          }
        } catch {
          // Keep the coordinate fallback.
        }
        onAddressChange(resolved);
        setLocating(false);
      },
      () => {
        // Denied / unavailable / timed out.
        setError(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
        <span className="text-sm font-semibold text-foreground">{t("deliveryAddress")}</span>
      </div>

      {/* Map preview — recenters on the resolved coordinates. */}
      <div className="rounded-2xl border border-border overflow-hidden h-44 bg-secondary">
        <iframe
          title={t("mapTitle")}
          src={mapSrc(coords.lat, coords.lon)}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder={t("addressPlaceholder")}
        aria-label={t("deliveryAddress")}
        className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground btn-press disabled:opacity-60"
      >
        {locating ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" strokeWidth={2} />
        ) : (
          <Navigation className="w-4 h-4 text-primary" strokeWidth={2} />
        )}
        {locating ? t("locating") : t("useMyLocation")}
      </button>

      {error && (
        <p className="text-xs text-primary text-center">{t("locationError")}</p>
      )}
    </div>
  );
}
