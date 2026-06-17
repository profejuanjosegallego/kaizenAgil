"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/components/api";
import TopBar from "@/components/TopBar";
import { Avatar, Badge, Modal, EmptyState } from "@/components/ui";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/components/toast";
import MemberModal from "@/components/MemberModal";
import { Target, Users, GraduationCap, Plus, UserPlus, Trash2 } from "@/components/icons";
import { buildTabs } from "@/components/projectNav";
import { ROLES, TEAM_COLORS } from "@/lib/constants";

export default function TeamPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'team' | 'member' | 'objectives'

  async function loadAll() {
    const data = await api.get(`/api/projects/${id}/overview`);
    setUser(data.user);
    setProject(data.project);
    setTeams(data.teams);
    setMembers(data.members);
    setLoading(false);
  }

  useEffect(() => {
    loadAll().catch(() => setLoading(false));
  }, [id]);

  const isDocente = user?.role === ROLES.DOCENTE;
  const teamName = (tid) => teams.find((t) => t.id === tid)?.name || "Sin equipo";

  async function assignTeam(membershipId, teamId) {
    try {
      const { membership } = await api.patch(
        `/api/projects/${id}/members/${membershipId}`,
        { teamId }
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === membershipId ? { ...m, team: membership.team } : m))
      );
      toast.success("Equipo asignado");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleSM(member) {
    try {
      const { membership } = await api.patch(
        `/api/projects/${id}/members/${member.id}`,
        { scrumMaster: !member.scrumMaster }
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, scrumMaster: membership.scrumMaster } : m))
      );
      toast.success(
        membership.scrumMaster
          ? `${member.user.name} ahora es Scrum Master`
          : `${member.user.name} ya no es Scrum Master`
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeMember(membershipId) {
    if (!confirm("¿Quitar a esta persona del proyecto?")) return;
    try {
      await api.del(`/api/projects/${id}/members/${membershipId}`);
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
      toast.success("Integrante quitado");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeTeam(teamId) {
    if (!confirm("¿Eliminar este equipo?")) return;
    try {
      await api.del(`/api/projects/${id}/teams/${teamId}`);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      toast.success("Equipo eliminado");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return <LoadingScreen message="Cargando equipo y objetivos…" />;
  }

  return (
    <div className="min-h-screen">
      <TopBar user={user} breadcrumb={project?.name} tabs={buildTabs(id)} activeTab="team" />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Objetivos */}
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Target size={18} className="text-pine" /> Objetivos del proyecto
            </h2>
            {isDocente && (
              <button className="btn-ghost text-xs" onClick={() => setModal("objectives")}>
                Editar
              </button>
            )}
          </div>
          {project.description && (
            <p className="mt-2 text-sm text-ink/70">{project.description}</p>
          )}
          {project.objectives?.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {project.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink/80">
                  <span className="font-bold text-pine">{i + 1}.</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/45">Sin objetivos definidos.</p>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Equipos */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-ink">Equipos</h2>
              {isDocente && (
                <button className="btn-ghost text-xs" onClick={() => setModal("team")}>
                  <Plus size={14} /> Equipo
                </button>
              )}
            </div>
            {teams.length === 0 ? (
              <EmptyState icon={<Users size={22} />} title="Sin equipos" hint="Crea el primer equipo." />
            ) : (
              <ul className="space-y-2">
                {teams.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-line p-3"
                  >
                    <span className="h-8 w-1.5 rounded-full" style={{ background: t.color }} />
                    <div className="flex-1">
                      <div className="font-semibold text-ink">{t.name}</div>
                      {t.moduleName && (
                        <div className="text-xs text-ink/55">{t.moduleName}</div>
                      )}
                    </div>
                    <Badge color={t.color}>
                      {members.filter((m) => m.team === t.id).length} miembros
                    </Badge>
                    {isDocente && (
                      <button
                        className="text-ink/35 hover:text-clay"
                        onClick={() => removeTeam(t.id)}
                        aria-label="Eliminar equipo"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Integrantes */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-ink">Integrantes</h2>
              {isDocente && (
                <button className="btn-ghost text-xs" onClick={() => setModal("member")}>
                  <UserPlus size={14} /> Administrar
                </button>
              )}
            </div>
            {members.length === 0 ? (
              <EmptyState icon={<GraduationCap size={22} />} title="Sin integrantes" />
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-line p-2.5"
                  >
                    <Avatar name={m.user.name} color={m.user.avatarColor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium text-ink">{m.user.name}</span>
                        {m.scrumMaster && <Badge color="#0891B2">SM</Badge>}
                      </div>
                      <div className="truncate text-xs text-ink/50">{m.user.email}</div>
                    </div>
                    {isDocente && m.user.role !== ROLES.DOCENTE && (
                      <button
                        title={m.scrumMaster ? "Quitar Scrum Master" : "Hacer Scrum Master"}
                        onClick={() => toggleSM(m)}
                        className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition ${
                          m.scrumMaster
                            ? "border-clay bg-clay/10 text-clay"
                            : "border-line text-ink/45 hover:border-clay hover:text-clay"
                        }`}
                      >
                        SM
                      </button>
                    )}
                    {isDocente ? (
                      <select
                        className="input w-auto py-1 text-xs"
                        value={m.team || ""}
                        onChange={(e) => assignTeam(m.id, e.target.value)}
                      >
                        <option value="">Sin equipo</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge>{teamName(m.team)}</Badge>
                    )}
                    {isDocente && m.user.role !== ROLES.DOCENTE && (
                      <button
                        className="text-ink/35 hover:text-clay"
                        onClick={() => removeMember(m.id)}
                        aria-label="Quitar integrante"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      {modal === "team" && (
        <TeamModal
          projectId={id}
          onClose={() => setModal(null)}
          onCreated={(team) => {
            setTeams((prev) => [...prev, team]);
            setModal(null);
            toast.success("Equipo creado");
          }}
        />
      )}
      {modal === "member" && (
        <MemberModal
          projectId={id}
          teams={teams}
          members={members}
          onClose={() => setModal(null)}
          onAdded={(membership) => {
            setMembers((prev) => [...prev, membership]);
            toast.success("Integrante agregado");
          }}
          onRemovedMember={(membershipId) =>
            setMembers((prev) => prev.filter((m) => m.id !== membershipId))
          }
          onUpdatedMember={(membership) =>
            setMembers((prev) =>
              prev.map((m) =>
                m.id === membership.id
                  ? { ...m, team: membership.team, scrumMaster: membership.scrumMaster }
                  : m
              )
            )
          }
        />
      )}
      {modal === "objectives" && (
        <ObjectivesModal
          projectId={id}
          project={project}
          onClose={() => setModal(null)}
          onSaved={(p) => {
            setProject(p);
            setModal(null);
            toast.success("Objetivos actualizados");
          }}
        />
      )}
    </div>
  );
}

function TeamModal({ projectId, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", moduleName: "", color: TEAM_COLORS[0] });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    try {
      const { team } = await api.post(`/api/projects/${projectId}/teams`, form);
      onCreated(team);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo equipo"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-pine" onClick={save} disabled={!form.name.trim()}>Crear</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Nombre del equipo</label>
          <input className="input" value={form.name} onChange={set("name")} placeholder="Equipo 1" />
        </div>
        <div>
          <label className="label">Módulo / área (opcional)</label>
          <input className="input" value={form.moduleName} onChange={set("moduleName")} placeholder="Catálogo e inventario" />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {TEAM_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`h-8 w-8 rounded-full border-2 ${
                  form.color === c ? "border-ink" : "border-transparent"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm font-medium text-clay">{error}</p>}
      </div>
    </Modal>
  );
}

function ObjectivesModal({ projectId, project, onClose, onSaved }) {
  const [description, setDescription] = useState(project.description || "");
  const [objectives, setObjectives] = useState(
    project.objectives?.length ? project.objectives : [""]
  );
  const [error, setError] = useState("");

  async function save() {
    try {
      const { project: updated } = await api.patch(`/api/projects/${projectId}`, {
        name: project.name,
        description,
        objectives: objectives.map((o) => o.trim()).filter(Boolean),
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar objetivos"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-pine" onClick={save}>Guardar</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Descripción</label>
          <textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="label">Objetivos</label>
          <div className="space-y-2">
            {objectives.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  value={o}
                  onChange={(e) =>
                    setObjectives((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))
                  }
                />
                <button
                  className="btn-ghost px-3"
                  onClick={() => setObjectives((arr) => arr.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="text-sm font-semibold text-pine hover:text-clay"
              onClick={() => setObjectives((arr) => [...arr, ""])}
            >
              + Agregar objetivo
            </button>
          </div>
        </div>
        {error && <p className="text-sm font-medium text-clay">{error}</p>}
      </div>
    </Modal>
  );
}
