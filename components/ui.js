"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, Inbox, X } from "@/components/icons";

export function PasswordInput({ value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="input pr-10"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-ink/45 hover:bg-paper-2 hover:text-ink"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function Avatar({ name, color = "#1F5E4A", size = 28 }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-grid place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
      title={name}
    >
      {initials}
    </span>
  );
}

export function Badge({ children, color = "#8a948c", soft = true }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={
        soft
          ? { background: `${color}1a`, color }
          : { background: color, color: "#fff" }
      }
    >
      {children}
    </span>
  );
}

export function Spinner({ label = "Cargando…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink/50">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-pine" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-paper-2 ${className}`} />;
}

export function CardsSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3 p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, c) => (
        <div key={c} className="min-w-[260px] flex-1 space-y-2 rounded-xl2 border border-line bg-paper-2/40 p-2">
          <Skeleton className="mx-1 mb-2 h-4 w-24" />
          {Array.from({ length: 3 + (c % 2) }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-line bg-white p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-1">
                <Skeleton className="h-2 w-8" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, hint }) {
  return (
    <div className="rounded-xl2 border border-dashed border-line bg-paper-2/50 px-6 py-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-paper-2 text-ink/40">
        {icon || <Inbox size={22} />}
      </div>
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink/55">{hint}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide, accent }) {
  // Montaje en cliente para poder usar portal sin romper el SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  // Portal a <body>: evita que el header (con backdrop-blur) "atrape" el modal.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm animate-[overlayIn_.15s_ease-out]"
      onMouseDown={onClose}
    >
      <div
        className={`card my-8 w-full overflow-hidden p-0 animate-[modalPop_.2s_ease-out] ${wide ? "max-w-2xl" : "max-w-lg"}`}
        style={accent ? { borderTop: `4px solid ${accent}` } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            {accent && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: accent }}
              />
            )}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ink/50 hover:bg-paper-2"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
