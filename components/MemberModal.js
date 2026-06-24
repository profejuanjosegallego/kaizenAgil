"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/api";
import { toast } from "@/components/toast";
import { Modal, Avatar, Spinner, Badge } from "@/components/ui";
import { UserPlus, Trash2, X, School, ShieldCheck } from "@/components/icons";

/**
 * Administrar integrantes:
 *  - "En este proyecto": quita integrantes del proyecto (no borra la cuenta).
 *  - "Estudiantes registrados": agrega los que ya se registraron, o elimina
 *    su cuenta de la base de datos por completo.
 */
export default function MemberModal({
  projectId,
  teams,
  members,
  ownerId,
  onClose,
  onAdded,
  onRemovedMember,
  onUpdatedMember,
}) {
  const [students, setStudents] = useState(null);
  const [teachers, setTeachers] = useState(null); // docentes que se pueden sumar
  const [teacherId, setTeacherId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  function loadStudents() {
    api
      .get("/api/students")
      .then((r) => setStudents(r.students))
      .catch(() => setStudents([]));
  }
  function loadTeachers() {
    api
      .get(`/api/projects/${projectId}/teachers`)
      .then((r) => setTeachers(r.teachers))
      .catch(() => setTeachers([]));
  }
  useEffect(loadStudents, []);
  useEffect(loadTeachers, [projectId]);

  const memberUserIds = new Set(members.map((m) => m.user.id));
  // Docentes que ya pertenecen al proyecto (co-gestores).
  const teacherMembers = members.filter((m) => m.user.role === "docente");

  async function addTeacher() {
    if (!teacherId) return;
    setBusy(`teacher-add`);
    try {
      const { membership } = await api.post(`/api/projects/${projectId}/teachers`, {
        userId: teacherId,
      });
      onAdded(membership);
      setTeacherId("");
      loadTeachers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }
  const q = search.trim().toLowerCase();
  const available = (students || []).filter(
    (s) =>
      !memberUserIds.has(s.id) &&
      (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
  );
  // Integrantes que se pueden quitar (estudiantes, no el docente).
  const removableMembers = members.filter((m) => m.user.role !== "docente");

  async function add(s) {
    setBusy(`add-${s.id}`);
    try {
      const { membership } = await api.post(`/api/projects/${projectId}/members`, {
        name: s.name,
        email: s.email,
        teamId: teamId || null,
      });
      onAdded(membership);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function assignTeam(m, teamValue) {
    setBusy(`team-${m.id}`);
    try {
      const { membership } = await api.patch(
        `/api/projects/${projectId}/members/${m.id}`,
        { teamId: teamValue || null }
      );
      onUpdatedMember && onUpdatedMember(membership);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function removeFromProject(m) {
    if (!confirm(`¿Quitar a ${m.user.name} de este proyecto?`)) return;
    setBusy(`rm-${m.id}`);
    try {
      await api.del(`/api/projects/${projectId}/members/${m.id}`);
      onRemovedMember(m.id);
      loadTeachers(); // si era docente, vuelve a estar disponible para agregar
      toast.success("Integrante quitado del proyecto");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function deleteFromDB(s) {
    if (
      !confirm(
        `¿Eliminar la cuenta de ${s.name} de la base de datos? Esta acción no se puede deshacer.`
      )
    )
      return;
    setBusy(`del-${s.id}`);
    try {
      await api.del(`/api/students/${s.id}`);
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
      toast.success("Cuenta eliminada de la base de datos");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title="Administrar integrantes"
      footer={
        <button className="btn-pine" onClick={onClose}>
          Listo
        </button>
      }
    >
      <div className="space-y-5">
        {/* Docentes (co-gestores) */}
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
            <School size={15} className="text-pine" /> Docentes (co-gestores)
          </h4>
          <p className="mb-2 rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink/60">
            Otros docentes que pueden gestionar este proyecto contigo (crear y
            asignar HUs, administrar equipos e integrantes).
          </p>

          {teacherMembers.length > 0 && (
            <div className="mb-2 space-y-2">
              {teacherMembers.map((m) => {
                const isOwner = ownerId && m.user.id === ownerId;
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-line p-2.5"
                  >
                    <Avatar name={m.user.name} color={m.user.avatarColor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium text-ink">{m.user.name}</span>
                        {isOwner ? (
                          <Badge color="#1D4ED8">
                            <ShieldCheck size={11} /> Dueño
                          </Badge>
                        ) : (
                          <Badge color="#0891B2">Co-docente</Badge>
                        )}
                      </div>
                      <div className="truncate text-xs text-ink/50">{m.user.email}</div>
                    </div>
                    {!isOwner && (
                      <button
                        className="grid h-8 w-8 place-items-center rounded-full text-ink/50 hover:bg-clay/10 hover:text-clay disabled:opacity-50"
                        title="Quitar del proyecto"
                        aria-label="Quitar del proyecto"
                        onClick={() => removeFromProject(m)}
                        disabled={busy === `rm-${m.id}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <select
              className="input"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              disabled={teachers === null}
            >
              <option value="">
                {teachers === null
                  ? "Cargando docentes…"
                  : teachers.length === 0
                  ? "No hay otros docentes registrados"
                  : "Elige un docente…"}
              </option>
              {(teachers || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.email}
                </option>
              ))}
            </select>
            <button
              className="btn-pine whitespace-nowrap"
              onClick={addTeacher}
              disabled={!teacherId || busy === "teacher-add"}
            >
              <UserPlus size={14} />
              {busy === "teacher-add" ? "…" : "Agregar"}
            </button>
          </div>
        </section>

        {/* En el proyecto */}
        <section>
          <h4 className="mb-2 text-sm font-bold text-ink">
            En este proyecto ({removableMembers.length})
          </h4>
          {removableMembers.length === 0 ? (
            <p className="rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink/55">
              Todavía no hay estudiantes en el proyecto.
            </p>
          ) : (
            <div className="thin-scroll max-h-40 space-y-2 overflow-y-auto">
              {removableMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-line p-2.5"
                >
                  <Avatar name={m.user.name} color={m.user.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-ink">{m.user.name}</span>
                      {m.scrumMaster && <Badge color="#0891B2">SM</Badge>}
                    </div>
                    {!m.team && (
                      <div className="truncate text-xs font-medium text-[#b07a1e]">
                        Pendiente de asignar a equipo
                      </div>
                    )}
                  </div>
                  <select
                    className="input w-auto py-1 text-xs"
                    value={m.team || ""}
                    onChange={(e) => assignTeam(m, e.target.value)}
                    disabled={busy === `team-${m.id}`}
                  >
                    <option value="">Sin equipo</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full text-ink/50 hover:bg-clay/10 hover:text-clay disabled:opacity-50"
                    title="Quitar del proyecto"
                    aria-label="Quitar del proyecto"
                    onClick={() => removeFromProject(m)}
                    disabled={busy === `rm-${m.id}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Disponibles para agregar */}
        <section>
          <h4 className="mb-2 text-sm font-bold text-ink">Estudiantes registrados</h4>
          <p className="mb-2 rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink/60">
            Agrega al equipo seleccionado a quienes ya se registraron. También puedes
            eliminar una cuenta de la base de datos.
          </p>

          <div className="mb-2 grid grid-cols-2 gap-2">
            <select className="input" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">Sin equipo</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="thin-scroll max-h-56 space-y-2 overflow-y-auto">
            {students === null ? (
              <Spinner label="Cargando estudiantes…" />
            ) : available.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/45">
                No hay estudiantes registrados disponibles.
              </p>
            ) : (
              available.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-line p-2.5"
                >
                  <Avatar name={s.name} color={s.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">{s.name}</div>
                    <div className="truncate text-xs text-ink/50">{s.email}</div>
                  </div>
                  <button
                    className="btn-pine py-1.5 text-xs"
                    onClick={() => add(s)}
                    disabled={busy === `add-${s.id}`}
                  >
                    <UserPlus size={14} />
                    {busy === `add-${s.id}` ? "…" : "Agregar"}
                  </button>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-clay/10 hover:text-clay disabled:opacity-50"
                    title="Eliminar de la base de datos"
                    aria-label="Eliminar de la base de datos"
                    onClick={() => deleteFromDB(s)}
                    disabled={busy === `del-${s.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}
