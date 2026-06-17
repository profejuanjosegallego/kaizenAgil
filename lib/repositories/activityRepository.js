import ActivityLog from "@/models/ActivityLog";

export const activityRepository = {
  log(data) {
    return ActivityLog.create(data);
  },
  listByProject(projectId) {
    return ActivityLog.find({ project: projectId }).sort({ createdAt: -1 });
  },
};
