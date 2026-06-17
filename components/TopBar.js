"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/api";
import { Avatar } from "@/components/ui";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { Settings, LogOut, KeyRound } from "@/components/icons";

export default function TopBar({ user, breadcrumb, tabs, activeTab }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function logout() {
    await api.post("/api/auth/logout");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/proyectos" className="text-lg font-extrabold tracking-tight text-ink">
          Kaizen<span className="text-clay">·</span>
        </Link>

        {breadcrumb && (
          <span className="hidden items-center gap-2 text-sm text-ink/50 sm:flex">
            <span>/</span>
            <span className="font-semibold text-ink/80">{breadcrumb}</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user?.superAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-pine hover:text-pine sm:inline-flex"
            >
              <Settings size={14} /> Administración
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <Avatar name={user.name} color={user.avatarColor} />
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-sm font-semibold text-ink">{user.name}</div>
                <div className="text-[11px] uppercase tracking-wide text-ink/45">
                  {user.role}
                </div>
              </div>
            </div>
          )}
          {user && (
            <button
              onClick={() => setShowPassword(true)}
              className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/55 hover:border-pine hover:text-pine"
              title="Cambiar contraseña"
              aria-label="Cambiar contraseña"
            >
              <KeyRound size={15} />
            </button>
          )}
          <button onClick={logout} className="btn-ghost gap-1.5 px-3 py-1.5 text-xs">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      {tabs && (
        <div className="thin-scroll mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${
                activeTab === t.key
                  ? "border-clay text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}
    </header>
  );
}
