"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "@/components/api";
import TopBar from "@/components/TopBar";
import { Avatar, Badge } from "@/components/ui";
import LoadingScreen from "@/components/LoadingScreen";
import { ChartColumn, Star, Flame, Circle, CircleCheck } from "@/components/icons";
import { buildTabs } from "@/components/projectNav";

const HEALTH = {
  excelente: { label: "Va excelente", color: "#0D9488", Icon: Star },
  normal: { label: "En ritmo", color: "#1D4ED8", Icon: CircleCheck },
  en_riesgo: { label: "Se está quemando", color: "#DC2626", Icon: Flame },
  sin_carga: { label: "Sin carga", color: "#64748B", Icon: Circle },
};

export default function MetricsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/projects/${id}/metrics`)
      .then((data) => {
        setUser(data.user);
        setProject(data.project);
        setMetrics(data.metrics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading || !metrics) {
    return <LoadingScreen message="Cargando métricas…" />;
  }

  const { summary, statusDistribution, byTeam, byMember } = metrics;
  const sinAvance = summary.total > 0 && summary.done === 0;
  const sinHistorias = summary.total === 0;

  return (
    <div className="min-h-screen">
      <TopBar
        user={user}
        breadcrumb={project?.name}
        tabs={buildTabs(id)}
        activeTab="metrics"
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {(sinHistorias || sinAvance) && (
          <div className="flex items-start gap-3 rounded-xl2 border border-line bg-white px-4 py-3 text-sm text-ink/70">
            <ChartColumn size={20} className="shrink-0 text-pine" />
            <p>
              {sinHistorias
                ? "Aún no hay historias en este proyecto. Crea historias en el tablero y las métricas empezarán a llenarse."
                : "Todas las historias están en “Por hacer”. Las métricas de avance, carga y desempeño se irán actualizando a medida que el equipo mueva sus tarjetas."}
            </p>
          </div>
        )}

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Historias totales" value={summary.total} />
          <StatCard label="Completado" value={`${summary.completionRate}%`} accent="#3E9C7A" />
          <StatCard label="En proceso" value={summary.in_progress} accent="#1F5E4A" />
          <StatCard label="Bloqueos" value={summary.blocked} accent="#E8643C" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución por estado */}
          <div className="card p-5">
            <h3 className="mb-4 font-bold text-ink">Distribución por estado</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusDistribution.map((s) => (
                    <Cell key={s.status} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Avance por equipo */}
          <div className="card p-5">
            <h3 className="mb-4 font-bold text-ink">Avance por equipo</h3>
            {byTeam.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/45">Aún no hay equipos.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byTeam} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="completionRate" radius={[0, 6, 6, 0]} fill="#1F5E4A">
                    {byTeam.map((t) => (
                      <Cell key={t.teamId || "none"} fill={t.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Desempeño por estudiante */}
        <div className="card p-5">
          <h3 className="mb-1 font-bold text-ink">Desempeño por estudiante</h3>
          <p className="mb-4 text-sm text-ink/55">
            Quién va excelente y quién se está quemando, según carga, bloqueos y
            tasa de finalización.
          </p>

          {byMember.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/45">
              Aún no hay integrantes con historias asignadas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/45">
                    <th className="py-2 pr-3">Estudiante</th>
                    <th className="px-3">Estado</th>
                    <th className="px-3 text-center">Total</th>
                    <th className="px-3 text-center">En proceso</th>
                    <th className="px-3 text-center">Bloqueos</th>
                    <th className="px-3 text-center">Terminado</th>
                    <th className="px-3">Avance</th>
                  </tr>
                </thead>
                <tbody>
                  {byMember.map((m) => {
                    const h = HEALTH[m.health] || HEALTH.normal;
                    return (
                      <tr key={m.userId} className="border-b border-line/60">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={m.name} color={m.avatarColor} size={26} />
                            <span className="font-medium text-ink">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-3">
                          <Badge color={h.color}>
                            <h.Icon size={12} /> {h.label}
                          </Badge>
                        </td>
                        <td className="px-3 text-center">{m.total}</td>
                        <td className="px-3 text-center">{m.in_progress}</td>
                        <td className="px-3 text-center font-semibold text-clay">
                          {m.blocked || ""}
                        </td>
                        <td className="px-3 text-center">{m.done}</td>
                        <td className="px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-paper-2">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${m.completionRate}%`,
                                  background: h.color,
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-ink/60">
                              {m.completionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent = "#0F1B2E" }) {
  return (
    <div className="card p-4">
      <div className="text-3xl font-extrabold" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-1 text-sm text-ink/55">{label}</div>
    </div>
  );
}

