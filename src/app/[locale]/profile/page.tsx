"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { userProfile } from "@/mock/data";
import {
  MapPin, Heart, Package, Settings, ChevronRight, LogOut,
  Bell, HelpCircle, Pencil, X,
} from "lucide-react";
import { Link } from "@/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const menuItems = [
  { icon: Package, labelKey: "menuOrders", href: "/orders" },
  { icon: MapPin, labelKey: "menuAddresses", href: "/addresses" },
  { icon: Heart, labelKey: "menuFavorites", href: "/favorites" },
  { icon: Bell, labelKey: "menuNotifications", href: "/profile" },
  { icon: HelpCircle, labelKey: "menuHelp", href: "/profile" },
  { icon: Settings, labelKey: "menuSettings", href: "/settings" },
];

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_profile");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.name) setName(p.name);
        if (p.phone) setPhone(p.phone);
      }
    } catch {}
  }, []);

  const openEdit = () => {
    setEditName(name);
    setEditPhone(phone);
    setShowEdit(true);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    const n = editName.trim();
    const ph = editPhone.trim();
    setName(n);
    setPhone(ph);
    try {
      localStorage.setItem("user_profile", JSON.stringify({ name: n, phone: ph }));
    } catch {}
    setShowEdit(false);
  };

  const avatarLetter = name.charAt(0).toUpperCase();

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4 space-y-5">
        {/* Avatar & info */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-primary-foreground">{avatarLetter}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-xl text-foreground truncate">{name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{phone}</p>
          </div>
          <button
            onClick={openEdit}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 btn-press"
            aria-label={t("editAria")}
          >
            <Pencil className="w-4 h-4 text-foreground" strokeWidth={1.75} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border p-4 text-center">
            <p className="font-black text-2xl text-foreground">{userProfile.ordersCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("statOrders")}</p>
          </div>
          <div className="rounded-2xl border border-border p-4 text-center">
            <p className="font-black text-2xl text-foreground">{(userProfile.totalSpent / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">{t("statTotalSpent")}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="rounded-2xl border border-border overflow-hidden">
          {menuItems.map(({ icon: Icon, labelKey, href }, idx) => (
            <Link
              key={labelKey}
              href={href}
              className={`flex items-center gap-3 px-4 py-4 hover:bg-secondary transition-colors btn-press${idx < menuItems.length - 1 ? " border-b border-border" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-foreground" strokeWidth={1.75} />
              </div>
              <span className="flex-1 font-semibold text-sm text-foreground">{t(labelKey)}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-destructive/30 text-destructive text-sm font-semibold btn-press">
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          {t("logout")}
        </button>
      </div>

      {/* Edit bottom sheet */}
      {showEdit && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEdit(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl p-5 max-w-[480px] mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-foreground">{t("editTitle")}</h2>
              <button
                onClick={() => setShowEdit(false)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center btn-press"
              >
                <X className="w-4 h-4 text-foreground" strokeWidth={1.75} />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("fullNameLabel")}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{t("phoneLabel")}</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+998 90 000 00 00"
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>
            <button
              onClick={saveEdit}
              disabled={!editName.trim()}
              className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 btn-press"
            >
              {t("save")}
            </button>
          </div>
        </>
      )}
    </LayoutWrapper>
  );
}
