import Membership from "@/models/Membership";

export const membershipRepository = {
  create(data) {
    return Membership.create(data);
  },
  findByProjectAndUser(projectId, userId) {
    return Membership.findOne({ project: projectId, user: userId });
  },
  listByProject(projectId) {
    return Membership.find({ project: projectId }).populate(
      "user",
      "name email role avatarColor"
    );
  },
  listByUser(userId) {
    return Membership.find({ user: userId });
  },
  update(membershipId, data) {
    return Membership.findByIdAndUpdate(membershipId, data, { new: true });
  },
  remove(membershipId) {
    return Membership.findByIdAndDelete(membershipId);
  },
  removeByProjectAndUser(projectId, userId) {
    return Membership.findOneAndDelete({ project: projectId, user: userId });
  },
  removeByUser(userId) {
    return Membership.deleteMany({ user: userId });
  },
};
