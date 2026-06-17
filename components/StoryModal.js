"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import {
  Hash,
  Type,
  FileText,
  Layers,
  SquareKanban,
  Flag,
  User,
  Users,
  CalendarClock,
  ListChecks,
  Ban,
  X,
  Plus,
} from "@/components/icons";
import {
  STATUS_META,
  STATUS_VALUES,
  STORY_TYPE_META,
  STORY_TYPE_VALUES,
  PRIORITY_META,
  PRIORITY_VALUES,
} from "@/lib/constants";

const blank = {
  code: "",
  title: "",
  description: "",
  type: "otro",
  status: "todo",
  priority: "medium",
  points: 1,
  assigneeId: "",
  teamId: "",
  blockedReason: "",
  dueDate: "",
  acceptanceCriteria: [],
};

// Campo con icono y etiqueta, para que el formulario se lea más fácil.
function Field({ icon: Icon, label, color, children, hint }) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink/80">
        {Icon && <Icon size={14} style={{ color: color || "#64748B" }} />}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

// Borde izquierdo de color para los selects que tienen significado visual.
const accentBorder = (color) => ({ borderLeftWidth: 4, borderLeftColor: color });

export default function StoryModal({
  story,
  members,
  teams,
  isDocente,
  canAssign = true,
  onClose,
  onSave,
  onDelete,
}) {
  const editing = Boolean(story);
  const [form, setForm] = useState(
    story
      ? {
          code: story.code || "",
          title: story.title || "",
          description: story.description || "",
          type: story.type,
          status: story.status,
          priority: story.priority,
          points: story.points,
          assigneeId: story.assignee?.id || "",
          teamId: story.team || "",
          blockedReason: story.blockedReason || "",
          dueDate: story.dueDate ? String(story.dueDate).slice(0, 10) : "",
          acceptanceCriteria: story.acceptanceCriteria || [],
        }
      : blank
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        points: Number(form.points),
        acceptanceCriteria: form.acceptanceCriteria.map((c) => c.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const typeColor = STORY_TYPE_META[form.type]?.color || "#1D4ED8";
  const statusColor = STATUS_META[form.status]?.color || "#64748B";
  const prioColor = PRIORITY_META[form.priority]?.color || "#64748B";

  return (
    <Modal
      open
      wide
      accent={typeColor}
      onClose={onClose}
      title={editing ? "Editar historia" : "Nueva historia de usuario"}
      footer={
        <>
          {editing && isDocente && (
            <button
              className="btn-ghost mr-auto gap-1.5 text-clay hover:border-clay"
              onClick={() => onDelete(story)}
            >
              <Ban size={15} /> Eliminar
            </button>
          )}
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-pine" onClick={save} disabled={saving || !form.title.trim()}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Field icon={Hash} label="Código">
            <input className="input" value={form.code} onChange={set("code")} placeholder="HU-01" />
          </Field>
          <div className="col-span-2">
            <Field icon={Type} label="Título" color={typeColor}>
              <input
                className="input"
                style={accentBorder(typeColor)}
                value={form.title}
                onChange={set("title")}
                placeholder="Como X quiero Y para Z"
              />
            </Field>
          </div>
        </div>

        <Field icon={FileText} label="Descripción">
          <textarea
            className="input min-h-24 leading-relaxed"
            value={form.description}
            onChange={set("description")}
            placeholder="Explica brevemente qué se debe hacer en esta historia…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field icon={Layers} label="Tipo / capa" color={typeColor}>
            <select className="input" style={accentBorder(typeColor)} value={form.type} onChange={set("type")}>
              {STORY_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>
                  {STORY_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </Field>
          <Field icon={SquareKanban} label="Estado" color={statusColor}>
            <select className="input" style={accentBorder(statusColor)} value={form.status} onChange={set("status")}>
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </Field>
          <Field icon={Flag} label="Prioridad" color={prioColor}>
            <select className="input" style={accentBorder(prioColor)} value={form.priority} onChange={set("priority")}>
              {PRIORITY_VALUES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </select>
          </Field>
          <Field icon={Hash} label="Puntos">
            <input type="number" min="0" max="100" className="input" value={form.points} onChange={set("points")} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field
            icon={User}
            label="Responsable"
            hint={!canAssign ? "Solo el docente o el Scrum Master del equipo asignan." : undefined}
          >
            <select
              className="input disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink/50"
              value={form.assigneeId}
              onChange={set("assigneeId")}
              disabled={!canAssign}
            >
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </Field>
          <Field icon={Users} label="Equipo">
            <select className="input" value={form.teamId} onChange={set("teamId")}>
              <option value="">Sin equipo</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field icon={CalendarClock} label="Fecha de vencimiento" color="#0EA5E9">
            <input
              type="date"
              className="input"
              style={accentBorder("#0EA5E9")}
              value={form.dueDate}
              onChange={set("dueDate")}
            />
          </Field>
        </div>

        {form.status === "blocked" && (
          <Field icon={Ban} label="Motivo del bloqueo" color="#DC2626">
            <input
              className="input"
              style={accentBorder("#DC2626")}
              value={form.blockedReason}
              onChange={set("blockedReason")}
              placeholder="¿Qué lo tiene bloqueado?"
            />
          </Field>
        )}

        <Field icon={ListChecks} label="Criterios de aceptación" color="#0D9488">
          <div className="space-y-2">
            {form.acceptanceCriteria.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea
                  rows={2}
                  className="input min-h-16 resize-y leading-relaxed"
                  style={accentBorder("#0D9488")}
                  value={c}
                  placeholder={`Criterio ${i + 1}`}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      acceptanceCriteria: f.acceptanceCriteria.map((x, j) =>
                        j === i ? e.target.value : x
                      ),
                    }))
                  }
                />
                <button
                  className="mt-1 grid h-9 w-9 flex-none place-items-center rounded-xl border border-line text-ink/45 hover:border-clay hover:text-clay"
                  aria-label="Quitar criterio"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      acceptanceCriteria: f.acceptanceCriteria.filter((_, j) => j !== i),
                    }))
                  }
                >
                  <X size={15} />
                </button>
              </div>
            ))}
            <button
              className="inline-flex items-center gap-1 text-sm font-semibold text-pine hover:text-clay"
              onClick={() =>
                setForm((f) => ({ ...f, acceptanceCriteria: [...f.acceptanceCriteria, ""] }))
              }
            >
              <Plus size={15} /> Agregar criterio
            </button>
          </div>
        </Field>

        {error && <p className="text-sm font-medium text-clay">{error}</p>}
      </div>
    </Modal>
  );
}
