import mongoose from "mongoose";
import {
  STATUS,
  STATUS_VALUES,
  STORY_TYPE,
  STORY_TYPE_VALUES,
  PRIORITY,
  PRIORITY_VALUES,
} from "@/lib/constants";

/**
 * Historia de Usuario (HU). Es la tarjeta del tablero.
 */
const StorySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    code: { type: String, default: "" }, // ej: HU-07
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    acceptanceCriteria: { type: [String], default: [] },

    type: { type: String, enum: STORY_TYPE_VALUES, default: STORY_TYPE.OTRO },
    status: { type: String, enum: STATUS_VALUES, default: STATUS.TODO },
    priority: { type: String, enum: PRIORITY_VALUES, default: PRIORITY.MEDIUM },

    // Puntos de estimacion (story points) para metricas de carga.
    points: { type: Number, default: 1, min: 0 },

    // Posicion dentro de su columna (para drag & drop ordenado).
    order: { type: Number, default: 0 },

    blockedReason: { type: String, default: "" },
    // Fecha de vencimiento (entrega) de la historia.
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

StorySchema.index({ project: 1, status: 1, order: 1 });

export default mongoose.models.Story || mongoose.model("Story", StorySchema);
