import { projectService } from "./projectService";
import { teamRepository } from "@/lib/repositories/teamRepository";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { storyRepository } from "@/lib/repositories/storyRepository";
import { toUserDTO, toProjectDTO, toTeamDTO, toMembershipDTO, toStoryDTO } from "@/lib/dto";

/**
 * Devuelve TODO lo que necesita el tablero (y la pantalla de equipo) en una
 * sola petición: usuario, proyecto, equipos, integrantes e historias.
 * Así evitamos 4-5 round-trips a la base de datos.
 */
export const overviewService = {
  async get(projectId, user) {
    const project = await projectService.getWithAccess(projectId, user);
    const [teams, memberships, stories] = await Promise.all([
      teamRepository.listByProject(projectId),
      membershipRepository.listByProject(projectId),
      storyRepository.listByProject(projectId),
    ]);
    return {
      user: toUserDTO(user),
      project: toProjectDTO(project),
      teams: teams.map(toTeamDTO),
      members: memberships.map(toMembershipDTO),
      stories: stories.map(toStoryDTO),
    };
  },
};
