import Project from "@/models/Project";

export const projectRepository = {
  create(data) {
    return Project.create(data);
  },
  findById(projectId) {
    return Project.findById(projectId).populate("owner", "name email role avatarColor");
  },
  findBySlug(slug) {
    return Project.findOne({ slug });
  },
  listForOwner(ownerId) {
    return Project.find({ owner: ownerId }).sort({ createdAt: -1 });
  },
  listByIds(ids) {
    return Project.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  },
  update(projectId, data) {
    return Project.findByIdAndUpdate(projectId, data, { new: true, runValidators: true });
  },
  remove(projectId) {
    return Project.findByIdAndDelete(projectId);
  },
};
