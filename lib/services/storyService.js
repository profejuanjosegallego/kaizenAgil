import { connectToDatabase } from "@/lib/db";
import { storyRepository } from "@/lib/repositories/storyRepository";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { toStoryDTO } from "@/lib/dto";
import { projectService, assertOwner } from "./projectService";
import { STATUS } from "@/lib/constants";
import { NotFoundError, ForbiddenError } from "@/lib/errors";

/**
 * Verifica que el usuario pueda asignar responsables a una HU:
 * - el docente dueño del proyecto puede en todas;
 * - un Scrum Master solo en las HU de SU equipo.
 */
async function assertCanAssign(project, user, storyTeamId) {
  const ownerId = String(project.owner._id || project.owner);
  if (ownerId === String(user._id)) return;
  const membership = await membershipRepository.findByProjectAndUser(project._id, user._id);
  if (
    membership?.scrumMaster &&
    storyTeamId &&
    String(membership.team) === String(storyTeamId)
  ) {
    return;
  }
  throw new ForbiddenError(
    "Solo el docente o el Scrum Master del equipo pueden asignar responsables"
  );
}

export const storyService = {
  async listByProject(projectId, user) {
    await projectService.getWithAccess(projectId, user);
    const stories = await storyRepository.listByProject(projectId);
    return stories.map(toStoryDTO);
  },

  async create(projectId, user, data) {
    const project = await projectService.getWithAccess(projectId, user);
    await connectToDatabase();

    if (data.assignee) {
      await assertCanAssign(project, user, data.team);
    }

    const status = data.status || STATUS.TODO;
    const last = await storyRepository.maxOrderInStatus(projectId, status);
    const order = last ? last.order + 1 : 0;

    const story = await storyRepository.create({
      ...data,
      project: projectId,
      status,
      order,
      completedAt: status === STATUS.DONE ? new Date() : null,
    });

    await activityRepository.log({
      project: projectId,
      story: story._id,
      actor: user._id,
      action: "created",
      toStatus: status,
    });

    const populated = await storyRepository.findById(story._id);
    return toStoryDTO(populated);
  },

  async update(projectId, storyId, user, data) {
    const project = await projectService.getWithAccess(projectId, user);
    const current = await storyRepository.findById(storyId);
    if (!current || String(current.project) !== String(projectId)) {
      throw new NotFoundError("Historia no encontrada");
    }

    // Cambio de responsable: requiere ser docente o SM del equipo.
    if ("assignee" in data) {
      const newA = data.assignee ? String(data.assignee) : "";
      const curA = current.assignee
        ? String(current.assignee._id || current.assignee)
        : "";
      if (newA !== curA) {
        const teamForCheck =
          data.team !== undefined ? data.team : current.team ? String(current.team) : null;
        await assertCanAssign(project, user, teamForCheck);
      }
    }

    // Si pasa a "Terminado" sella la fecha; si sale de ahi, la limpia.
    if (data.status && data.status !== current.status) {
      data.completedAt = data.status === STATUS.DONE ? new Date() : null;
    }

    const updated = await storyRepository.update(storyId, data);
    await activityRepository.log({
      project: projectId,
      story: storyId,
      actor: user._id,
      action: "updated",
      fromStatus: current.status,
      toStatus: updated.status,
    });
    return toStoryDTO(updated);
  },

  /** Mueve la tarjeta de columna (drag & drop) y reordena. */
  async move(projectId, storyId, user, { status, order, blockedReason }) {
    await projectService.getWithAccess(projectId, user);
    const current = await storyRepository.findById(storyId);
    if (!current || String(current.project) !== String(projectId)) {
      throw new NotFoundError("Historia no encontrada");
    }

    const patch = { status, order };
    if (status === STATUS.DONE && current.status !== STATUS.DONE) {
      patch.completedAt = new Date();
    }
    if (status !== STATUS.DONE) patch.completedAt = null;
    if (status === STATUS.BLOCKED) patch.blockedReason = blockedReason || current.blockedReason || "";
    if (status !== STATUS.BLOCKED) patch.blockedReason = "";

    const updated = await storyRepository.update(storyId, patch);

    if (current.status !== status) {
      await activityRepository.log({
        project: projectId,
        story: storyId,
        actor: user._id,
        action: "moved",
        fromStatus: current.status,
        toStatus: status,
      });
    }
    return toStoryDTO(updated);
  },

  async remove(projectId, storyId, user) {
    const project = await projectService.getWithAccess(projectId, user);
    assertOwner(project, user); // solo el docente dueño elimina HUs
    const current = await storyRepository.findById(storyId);
    if (!current || String(current.project) !== String(projectId)) {
      throw new NotFoundError("Historia no encontrada");
    }
    await storyRepository.remove(storyId);
    await activityRepository.log({
      project: projectId,
      story: storyId,
      actor: user._id,
      action: "deleted",
      fromStatus: current.status,
    });
    return { ok: true };
  },
};
