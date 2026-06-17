import { storyRepository } from "@/lib/repositories/storyRepository";
import { teamRepository } from "@/lib/repositories/teamRepository";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { projectService } from "./projectService";
import { toProjectDTO } from "@/lib/dto";
import { STATUS, STATUS_META } from "@/lib/constants";

/**
 * Calcula metricas del proyecto para el dashboard:
 * resumen global, carga y desempeño por estudiante, y avance por equipo.
 */
export const metricsService = {
  async forProject(projectId, user) {
    const project = await projectService.getWithAccess(projectId, user);

    const [stories, teams, memberships] = await Promise.all([
      storyRepository.listByProject(projectId),
      teamRepository.listByProject(projectId),
      membershipRepository.listByProject(projectId),
    ]);

    const summary = buildSummary(stories);
    const byMember = buildByMember(stories, memberships);
    const byTeam = buildByTeam(stories, teams);
    const statusDistribution = buildStatusDistribution(stories);

    return {
      project: toProjectDTO(project),
      metrics: { summary, statusDistribution, byMember, byTeam },
    };
  },
};

function emptyCounts() {
  return {
    total: 0,
    points: 0,
    todo: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    donePoints: 0,
    wipPoints: 0,
  };
}

function tally(acc, s) {
  acc.total += 1;
  acc.points += s.points || 0;
  acc[s.status] = (acc[s.status] || 0) + 1;
  if (s.status === STATUS.DONE) acc.donePoints += s.points || 0;
  if (s.status === STATUS.IN_PROGRESS || s.status === STATUS.BLOCKED) {
    acc.wipPoints += s.points || 0;
  }
}

function buildSummary(stories) {
  const acc = emptyCounts();
  stories.forEach((s) => tally(acc, s));
  acc.completionRate = acc.total ? Math.round((acc.done / acc.total) * 100) : 0;
  return acc;
}

function buildStatusDistribution(stories) {
  const base = {};
  Object.entries(STATUS_META).forEach(([key, meta]) => {
    base[key] = { status: key, label: meta.label, color: meta.color, count: 0 };
  });
  stories.forEach((s) => {
    if (base[s.status]) base[s.status].count += 1;
  });
  return Object.values(base);
}

function buildByMember(stories, memberships) {
  const map = new Map();
  // Inicializa con todos los miembros para que aparezcan aunque no tengan HUs.
  memberships.forEach((m) => {
    if (m.user && m.user._id) {
      map.set(String(m.user._id), {
        userId: String(m.user._id),
        name: m.user.name,
        avatarColor: m.user.avatarColor,
        team: m.team ? String(m.team) : null,
        ...emptyCounts(),
      });
    }
  });

  stories.forEach((s) => {
    if (!s.assignee) return;
    const key = String(s.assignee._id || s.assignee);
    if (!map.has(key)) {
      map.set(key, {
        userId: key,
        name: s.assignee.name || "Sin nombre",
        avatarColor: s.assignee.avatarColor || "#1F5E4A",
        team: null,
        ...emptyCounts(),
      });
    }
    tally(map.get(key), s);
  });

  return Array.from(map.values())
    .map((m) => ({
      ...m,
      completionRate: m.total ? Math.round((m.done / m.total) * 100) : 0,
      health: classifyHealth(m),
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Heuristica simple de "salud" del estudiante:
 *  - excelente: buena tasa de terminado y poco bloqueo.
 *  - en riesgo (se quema): mucha carga en proceso/bloqueada frente a lo terminado.
 *  - normal: el resto.
 */
function classifyHealth(m) {
  if (m.total === 0) return "sin_carga";
  const wip = m.in_progress + m.blocked;
  if (m.completionRate >= 60 && m.blocked === 0) return "excelente";
  if (m.blocked >= 2 || wip >= 4 || (m.completionRate < 25 && m.total >= 4)) {
    return "en_riesgo";
  }
  return "normal";
}

function buildByTeam(stories, teams) {
  const map = new Map();
  teams.forEach((t) => {
    map.set(String(t._id), {
      teamId: String(t._id),
      name: t.name,
      color: t.color,
      moduleName: t.moduleName,
      ...emptyCounts(),
    });
  });
  const sinEquipo = { teamId: null, name: "Sin equipo", color: "#8a948c", ...emptyCounts() };

  stories.forEach((s) => {
    const key = s.team ? String(s.team) : null;
    const bucket = key && map.has(key) ? map.get(key) : sinEquipo;
    tally(bucket, s);
  });

  const result = Array.from(map.values()).map((t) => ({
    ...t,
    completionRate: t.total ? Math.round((t.done / t.total) * 100) : 0,
  }));
  if (sinEquipo.total > 0) {
    result.push({
      ...sinEquipo,
      completionRate: Math.round((sinEquipo.done / sinEquipo.total) * 100),
    });
  }
  return result;
}
