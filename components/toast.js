"use client";

import { useEffect, useState } from "react";
import { Check, X, Info } from "@/components/icons";

/**
 * Sistema de notificaciones minimo, sin contexto:
 * llama `toast("Guardado")` desde cualquier parte y se muestra abajo a la
 * derecha. <Toaster/> se monta una vez en el layout.
 */
let listeners = [];
let counter = 0;

export function toast(message, type = "success") {
  const item = { id: ++counter, message, type };
  listeners.forEach((l) => l(item));
}
toast.success = (m) => toast(m, "success");
toast.error = (m) => toast(m, "error");
toast.info = (m) => toast(m, "info");

const STYLES = {
  success: "bg-pine text-white",
  error: "bg-[#DC2626] text-white",
  info: "bg-ink text-white",
};
const ICONS = { success: Check, error: X, info: Info };

export function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const listener = (item) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
      }, 3500);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2">
      {items.map((t) => {
        const Icon = ICONS[t.type] || ICONS.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lift ${
              STYLES[t.type] || STYLES.info
            } animate-[fadeIn_.15s_ease]`}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
              <Icon size={13} />
            </span>
            <span className="flex-1">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
