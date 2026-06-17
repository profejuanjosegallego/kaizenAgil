import Team from "@/models/Team";

export const teamRepository = {
  create(data) {
    return Team.create(data);
  },
  findById(teamId) {
    return Team.findById(teamId);
  },
  listByProject(projectId) {
    return Team.find({ project: projectId }).sort({ createdAt: 1 });
  },
  update(teamId, data) {
    return Team.findByIdAndUpdate(teamId, data, { new: true, runValidators: true });
  },
  remove(teamId) {
    return Team.findByIdAndDelete(teamId);
  },
};
