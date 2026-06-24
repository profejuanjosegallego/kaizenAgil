"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/api";
import TopBar from "@/components/TopBar";
import { Spinner, Avatar, EmptyState, Badge } from "@/components/ui";
import { toast } from "@/components/toast";
import { CircleCheck, School, ShieldCheck } from "@/components/icons";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const me = await api.get("/api/auth/me");
    setUser(me.user);
    if (!me.user.superAdmin) {
      router.replace("/proyectos");
      return;
    }
    const [pend, docs] = await Promise.all([
      api.get("/api/admin/pending"),
      api.get("/api/admin/docentes"),
    ]);
    setPending(pend.pending);
    setDocentes(docs.docentes);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function approve(u) {
    try {
      const { user: approved } = await api.patch(`/api/admin/users/${u.id}`);
      setPending((prev) => prev.filter((x) => x.id !== u.id));
      // Aparece de inmediato en la lista de docentes activos (aún sin grupos).
      setDocentes((prev) => [...prev, { ...(approved || u), projects: [] }]);
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

        {/* Docentes activos y sus grupos */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <School size={22} className="text-pine" /> Docentes
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            Profesores autorizados y los grupos (proyectos) a los que pertenecen.
          </p>

          <div className="mt-6">
            {loading ? (
              <Spinner />
            ) : docentes.length === 0 ? (
              <EmptyState
                icon={<School size={22} />}
                title="Todavía no hay docentes activos"
                hint="Cuando autorices a un docente, aparecerá aquí."
              />
            ) : (
              <ul className="space-y-2">
                {docentes.map((d) => (
                  <li key={d.id} className="card p-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} color={d.avatarColor} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-ink">{d.name}</span>
                          {d.superAdmin && (
                            <Badge color="#1D4ED8">
                              <ShieldCheck size={11} /> Admin
                            </Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-ink/50">{d.email}</div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-ink/45">
                        {d.projects.length} grupo{d.projects.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {d.projects.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
                        {d.projects.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2/60 px-2.5 py-1 text-xs"
                            title={
                              p.relation === "propietario" ? "Propietario del proyecto" : "Miembro del proyecto"
                            }
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: p.color || "#94A3B8" }}
                            />
                            <span className="font-medium text-ink">{p.name}</span>
                            {p.team && <span className="text-ink/45">· {p.team}</span>}
                            <span className="text-ink/40">
                              ({p.relation === "propietario" ? "propietario" : "miembro"})
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
