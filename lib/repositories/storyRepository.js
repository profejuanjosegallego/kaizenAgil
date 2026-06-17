import Story from "@/models/Story";

export const storyRepository = {
  create(data) {
    return Story.create(data);
  },
  findById(storyId) {
    return Story.findById(storyId).populate("assignee", "name email role avatarColor");
  },
  listByProject(projectId) {
    return Story.find({ project: projectId })
      .populate("assignee", "name email role avatarColor")
      .sort({ status: 1, order: 1 });
  },
  update(storyId, data) {
    return Story.findByIdAndUpdate(storyId, data, {
      new: true,
      runValidators: true,
    }).populate("assignee", "name email role avatarColor");
  },
  remove(storyId) {
    return Story.findByIdAndDelete(storyId);
  },
  maxOrderInStatus(projectId, status) {
    return Story.findOne({ project: projectId, status })
      .sort({ order: -1 })
      .select("order");
  },
  countByProject(projectId) {
    return Story.countDocuments({ project: projectId });
  },
  unassignUser(userId) {
    return Story.updateMany({ assignee: userId }, { assignee: null });
  },
};
