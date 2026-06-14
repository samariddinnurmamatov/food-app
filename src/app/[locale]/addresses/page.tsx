"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { MapPin, Home, Briefcase, Plus, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Address {
  id: string;
  type: "home" | "work" | "other";
  label: string;
  address: string;
  detail?: string;
  isDefault: boolean;
}

const typeIcons: Record<Address["type"], LucideIcon> = { home: Home, work: Briefcase, other: MapPin };
const typeLabelKeys: Record<Address["type"], string> = { home: "typeHome", work: "typeWork", other: "typeOther" };

const initial: Address[] = [
  { id: "1", type: "home", label: "Uy", address: "Chilonzor 12-kvartal, 5-uy", detail: "Toshkent", isDefault: true },
  { id: "2", type: "work", label: "Ish", address: "Amir Temur ko'chasi, 107-bino", detail: "Toshkent", isDefault: false },
];

export default function AddressesPage() {
  const t = useTranslations("Addresses");
  const [addresses, setAddresses] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState<Address["type"]>("other");
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newDetail, setNewDetail] = useState("");

  const setDefault = (id: string) => setAddresses((p) => p.map((a) => ({ ...a, isDefault: a.id === id })));
  const remove = (id: string) => setAddresses((p) => p.filter((a) => a.id !== id));
  const add = () => {
    if (!newAddress.trim()) return;
    setAddresses((p) => [
      ...p,
      { id: Date.now().toString(), type: newType, label: newLabel || t(typeLabelKeys[newType]), address: newAddress, detail: newDetail || undefined, isDefault: p.length === 0 },
    ]);
    setShowModal(false);
    setNewLabel(""); setNewAddress(""); setNewDetail(""); setNewType("other");
  };

  return (
    <LayoutWrapper showFooter={false}>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4 space-y-3">
        {addresses.map((addr) => {
          const Icon = typeIcons[addr.type];
          return (
            <div key={addr.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-foreground" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm text-foreground">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{t("default")}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{addr.address}</p>
                  {addr.detail && <p className="text-xs text-muted-foreground mt-0.5">{addr.detail}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl bg-secondary text-xs font-semibold text-foreground btn-press">
                    <Check className="w-3.5 h-3.5" strokeWidth={2} /> {t("makeDefault")}
                  </button>
                )}
                <button
                  onClick={() => remove(addr.id)}
                  className={cn("flex items-center gap-1.5 justify-center py-2.5 rounded-xl bg-secondary text-xs font-semibold text-destructive btn-press", addr.isDefault ? "flex-1" : "px-5")}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {addr.isDefault ? t("delete") : ""}
                </button>
              </div>
            </div>
          );
        })}

        <button onClick={() => setShowModal(true)} className="w-full py-4 rounded-2xl border border-dashed border-border flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground btn-press">
          <Plus className="w-4.5 h-4.5" strokeWidth={1.75} /> {t("addNew")}
        </button>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl p-5 max-w-[480px] mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-foreground">{t("modalTitle")}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                <X className="w-4 h-4 text-foreground" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              {(["home", "work", "other"] as Address["type"][]).map((type) => {
                const Icon = typeIcons[type];
                return (
                  <button key={type} onClick={() => setNewType(type)} className={cn("flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-semibold transition-all btn-press", newType === type ? "border-primary bg-secondary text-foreground" : "border-border text-muted-foreground")}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {t(typeLabelKeys[type])}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3 mb-5">
              <input type="text" placeholder={t("labelPlaceholder")} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              <input type="text" placeholder={t("addressPlaceholder")} value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              <input type="text" placeholder={t("detailPlaceholder")} value={newDetail} onChange={(e) => setNewDetail(e.target.value)} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <button onClick={add} disabled={!newAddress.trim()} className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 btn-press">
              {t("save")}
            </button>
          </div>
        </>
      )}
    </LayoutWrapper>
  );
}
