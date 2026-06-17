"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/api";
import TopBar from "@/components/TopBar";
import { Spinner, Avatar, EmptyState } from "@/components/ui";
import { toast } from "@/components/toast";
import { CircleCheck } from "@/components/icons";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const me = await api.get("/api/auth/me");
    setUser(me.user);
    if (!me.user.superAdmin) {
      router.replace("/proyectos");
      return;
    }
    const res = await api.get("/api/admin/pending");
    setPending(res.pending);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function approve(u) {
    try {
      await api.patch(`/api/admin/users/${u.id}`);
      setPending((prev) => prev.filter((x) => x.id !== u.id));
      toast.success(`${u.name} autorizado como docente`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function reject(u) {
    if (!confirm(`¿Rechazar y eliminar la solicitud de ${u.name}?`)) return;
    try {
      await api.del(`/api/admin/users/${u.id}`);
      setPending((prev) => prev.filter((x) => x.id !== u.id));
      toast.success("Solicitud rechazada");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar user={user} breadcrumb="Administración" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Solicitudes de docente</h1>
        <p className="mt-1 text-sm text-ink/55">
          Autoriza o rechaza a las personas que se registraron como docente.
        </p>

        <div className="mt-6">
          {loading ? (
            <Spinner />
          ) : pending.length === 0 ? (
            <EmptyState
              icon={<CircleCheck size={22} />}
              title="No hay solicitudes pendientes"
              hint="Cuando alguien se registre como docente, aparecerá aquí."
            />
          ) : (
            <ul className="space-y-2">
              {pending.map((u) => (
                <li key={u.id} className="card flex items-center gap-3 p-3">
                  <Avatar name={u.name} color={u.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{u.name}</div>
                    <div className="truncate text-xs text-ink/50">{u.email}</div>
                  </div>
                  <button className="btn-pine py-1.5 text-xs" onClick={() => approve(u)}>
                    Autorizar
                  </button>
                  <button
                    className="btn-ghost py-1.5 text-xs text-clay hover:border-clay"
                    onClick={() => reject(u)}
                  >
                    Rechazar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
