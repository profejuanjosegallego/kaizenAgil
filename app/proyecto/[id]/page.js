"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/components/api";
import TopBar from "@/components/TopBar";
import Board from "@/components/Board";
import StoryModal from "@/components/StoryModal";
import { EmptyState } from "@/components/ui";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/components/toast";
import MemberModal from "@/components/MemberModal";
import { Hand, Plus, UserPlus, Users } from "@/components/icons";
import { buildTabs } from "@/components/projectNav";
import { ROLES } from "@/lib/constants";

export default function BoardPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterTeam, setFilterTeam] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [myMembership, setMyMembership] = useState(null);
  const [modal, setModal] = useState(null); // {story} | {story:null} for new
  const [showMembers, setShowMembers] = useState(false);

  async function loadAll() {
    const data = await api.get(`/api/projects/${id}/overview`);
    setUser(data.user);
    setProject(data.project);
    setTeams(data.teams);
    setMembers(data.members);
    setStories(data.stories);

    // Si es estudiante, lo enfocamos en el tablero de su equipo.
    const mine = data.members.find((x) => x.user?.id === data.user.id);
    setMyMembership(mine || null);
    if (data.user.role === ROLES.ESTUDIANTE && mine?.team) {
      setFilterTeam(mine.team);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll().catch(() => setLoading(false));
  }, [id]);

  const isDocente = user?.role === ROLES.DOCENTE;
  const isStudent = user?.role === ROLES.ESTUDIANTE;
  const myTeam = myMembership?.team || null;
  // Estudiante sin equipo: no puede ver ninguna HU hasta que lo asignen.
  const studentNoTeam = isStudent && !myTeam;

  const filtered = useMemo(() => {
    // El estudiante queda bloqueado a las HUs de SU equipo.
    if (isStudent) {
      if (!myTeam) return [];
      return stories.filter(
        (s) =>
          s.team === myTeam &&
          (!filterAssignee || s.assignee?.id === filterAssignee)
      );
    }
    return stories.filter(
      (s) =>
        (!filterTeam || s.team === filterTeam) &&
        (!filterAssignee || s.assignee?.id === filterAssignee)
    );
  }, [stories, filterTeam, filterAssignee, isStudent, myTeam]);

  async function handleMove(storyId, status, order) {
    // Optimista: actualiza UI antes de confirmar con el servidor.
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, status, order } : s))
    );
    try {
      const { story } = await api.patch(
        `/api/projects/${id}/stories/${storyId}/move`,
        { status, order }
      );
      setStories((prev) => prev.map((s) => (s.id === storyId ? story : s)));
    } catch (err) {
      toast.error(err.message || "No se pudo mover la tarjeta");
      loadAll(); // si falla, recarga estado real
    }
  }

  async function handleSave(data) {
    if (modal?.story) {
      const { story } = await api.patch(
        `/api/projects/${id}/stories/${modal.story.id}`,
        data
      );
      setStories((prev) => prev.map((s) => (s.id === story.id ? story : s)));
      toast.success("Historia actualizada");
    } else {
      const { story } = await api.post(`/api/projects/${id}/stories`, data);
      setStories((prev) => [...prev, story]);
      toast.success("Historia creada");
    }
    setModal(null);
  }

  async function handleDelete(story) {
    await api.del(`/api/projects/${id}/stories/${story.id}`);
    setStories((prev) => prev.filter((s) => s.id !== story.id));
    toast.success("Historia eliminada");
    setModal(null);
  }

  if (loading) {
    return <LoadingScreen message="Cargando tablero…" />;
  }

  return (
    <div className="min-h-screen">
      <TopBar
        user={user}
        breadcrumb={project?.name}
        tabs={buildTabs(id)}
        activeTab="board"
      />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {isStudent && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl2 border border-line bg-white px-4 py-3">
            <Hand size={20} className="shrink-0 text-pine" />
            <p className="text-sm text-ink/75">
              Hola <strong>{user.name}</strong>.{" "}
              {myTeam ? (
                <>
                  Perteneces al{" "}
                  <strong>{teams.find((t) => t.id === myTeam)?.name}</strong>. Estas viendo
                  las HUs de tu equipo; toma una y asígnatela.
                </>
              ) : (
                <>Aún no perteneces a un equipo, por eso todavía no ves historias.</>
              )}
            </p>
          </div>
        )}

        {studentNoTeam ? (
          <EmptyState
            icon={<Users size={22} />}
            title="Todavía no estás en un equipo"
            hint="Cuando tu docente te asigne a un equipo, verás aquí las historias de tu equipo."
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h1 className="mr-auto text-xl font-bold text-ink">Tablero</h1>

              {!isStudent && (
                <select
                  className="input w-auto py-1.5 text-sm"
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                >
                  <option value="">Todos los equipos</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                className="input w-auto py-1.5 text-sm"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="">Todos los responsables</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>

              {isDocente && (
                <button className="btn-ghost" onClick={() => setShowMembers(true)}>
                  <UserPlus size={16} /> Administrar integrantes
                </button>
              )}
              <button className="btn-clay" onClick={() => setModal({ story: null })}>
                <Plus size={16} /> Nueva HU
              </button>
            </div>

            <Board
              stories={filtered}
              teams={teams}
              onMove={handleMove}
              onOpen={(story) => setModal({ story })}
            />
          </>
        )}
      </main>

      {showMembers && (
        <MemberModal
          projectId={id}
          teams={teams}
          members={members}
          onClose={() => setShowMembers(false)}
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

      {modal && (
        <StoryModal
          story={modal.story}
          members={members}
          teams={teams}
          isDocente={isDocente}
          canAssign={
            isDocente ||
            (myMembership?.scrumMaster &&
              (!modal.story ||
                String(myMembership.team) === String(modal.story.team)))
          }
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
