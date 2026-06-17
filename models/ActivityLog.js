import mongoose from "mongoose";

/**
 * Registro de eventos sobre las historias. Sirve para metricas:
 * throughput, tiempo de ciclo, cuantas veces algo se bloqueo, etc.
 */
const ActivityLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    story: { type: mongoose.Schema.Types.ObjectId, ref: "Story", default: null },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true }, // created | moved | updated | deleted
    fromStatus: { type: String, default: null },
    toStatus: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
