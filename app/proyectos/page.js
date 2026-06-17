"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/components/api";
import TopBar from "@/components/TopBar";
import { CardsSkeleton, EmptyState, Modal } from "@/components/ui";
import { toast } from "@/components/toast";
import { Target, Kanban, Plus } from "@/components/icons";
import { ROLES } from "@/lib/constants";

export default function ProjectsPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  async function load() {
    const [me, res] = await Promise.all([
      api.get("/api/auth/me"),
      api.get("/api/projects"),
    ]);
    setUser(me.user);
    setProjects(res.projects);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const isDocente = user?.role === ROLES.DOCENTE;

  return (
    <div className="min-h-screen">
      <TopBar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Tus proyectos</h1>
            <p className="mt-1 text-sm text-ink/55">
              {isDocente
                ? "Crea proyectos, define objetivos y arma tus equipos."
                : "Estos son los proyectos en los que participas."}
            </p>
          </div>
          {isDocente && (
            <button className="btn-clay" onClick={() => setOpenNew(true)}>
              <Plus size={16} /> Nuevo proyecto
            </button>
          )}
        </div>

        <div className="mt-6">
          {loading ? (
            <CardsSkeleton />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<Kanban size={22} />}
              title="Aún no hay proyectos"
              hint={
                isDocente
                  ? "Crea el primero con el botón “Nuevo proyecto”."
                  : "Cuando un docente te agregue, aparecerá aquí."
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/proyecto/${p.id}`}
                  className="card group p-5 transition hover:shadow-lift"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: p.color }}
                    />
                    <span className="text-[11px] font-mono uppercase tracking-wide text-ink/40">
                      {p.slug}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-ink group-hover:text-pine">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/55">
                    {p.description || "Sin descripción"}
                  </p>
                  {p.objectives?.length > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pine">
                      <Target size={13} /> {p.objectives.length} objetivo
                      {p.objectives.length > 1 ? "s" : ""}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {openNew && (
        <NewProjectModal
          onClose={() => setOpenNew(false)}
          onCreated={(proj) => {
            setProjects((arr) => [proj, ...arr]);
            setOpenNew(false);
            toast.success("Proyecto creado");
          }}
        />
      )}
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState([""]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    setSaving(true);
    try {
      const { project } = await api.post("/api/projects", {
        name,
        description,
        objectives: objectives.map((o) => o.trim()).filter(Boolean),
      });
      onCreated(project);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo proyecto"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-pine" onClick={save} disabled={saving || !name.trim()}>
            {saving ? "Creando…" : "Crear proyecto"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Nombre</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Plataforma ReVuelta"
          />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea
            className="input min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿De qué trata el proyecto?"
          />
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
                    setObjectives((arr) =>
                      arr.map((x, j) => (j === i ? e.target.value : x))
                    )
                  }
                  placeholder={`Objetivo ${i + 1}`}
                />
                {objectives.length > 1 && (
                  <button
                    className="btn-ghost px-3"
                    onClick={() =>
                      setObjectives((arr) => arr.filter((_, j) => j !== i))
                    }
                  >
                    ✕
                  </button>
                )}
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
