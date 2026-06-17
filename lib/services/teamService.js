import { connectToDatabase } from "@/lib/db";
import { teamRepository } from "@/lib/repositories/teamRepository";
import { toTeamDTO } from "@/lib/dto";
import { projectService, assertOwner } from "./projectService";
import { NotFoundError } from "@/lib/errors";

export const teamService = {
  async listByProject(projectId, user) {
    await projectService.getWithAccess(projectId, user);
    const teams = await teamRepository.listByProject(projectId);
    return teams.map(toTeamDTO);
  },

  async create(projectId, user, data) {
    const project = await projectService.getWithAccess(projectId, user);
    assertOwner(project, user);
    const team = await teamRepository.create({ ...data, project: projectId });
    return toTeamDTO(team);
  },

  async update(projectId, teamId, user, data) {
    const project = await projectService.getWithAccess(projectId, user);
    assertOwner(project, user);
    const team = await teamRepository.findById(teamId);
    if (!team || String(team.project) !== String(projectId)) {
      throw new NotFoundError("Equipo no encontrado");
    }
    const updated = await teamRepository.update(teamId, data);
    return toTeamDTO(updated);
  },

  async remove(projectId, teamId, user) {
    const project = await projectService.getWithAccess(projectId, user);
    assertOwner(project, user);
    await connectToDatabase();
    await teamRepository.remove(teamId);
    return { ok: true };
  },
};
