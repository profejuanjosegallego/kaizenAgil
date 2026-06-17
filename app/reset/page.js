"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/api";
import { PasswordInput } from "@/components/ui";

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/reset", { token, newPassword: form.newPassword });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-6">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-4 text-xl font-extrabold text-ink">
          Kaizen<span className="text-clay">·</span>
        </div>
        <h1 className="text-xl font-bold text-ink">Nueva contraseña</h1>

        {!token ? (
          <p className="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-sm font-medium text-clay">
            Falta el enlace de restablecimiento. Abre el enlace que te llegó por correo.
          </p>
        ) : done ? (
          <div className="mt-3">
            <p className="rounded-lg bg-pine/10 px-3 py-2 text-sm font-medium text-pine">
              ¡Listo! Tu contraseña fue actualizada. Te llevamos al inicio de sesión…
            </p>
            <Link href="/login" className="btn-pine mt-4 w-full">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="label">Nueva contraseña</label>
              <PasswordInput value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" />
            </div>
            <div>
              <label className="label">Repite la contraseña</label>
              <PasswordInput value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
            </div>
            {error && <p className="text-sm font-medium text-clay">{error}</p>}
            <button className="btn-pine w-full" disabled={loading}>
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
