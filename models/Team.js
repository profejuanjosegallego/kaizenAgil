import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    // Modulo o area de negocio que trabaja el equipo (opcional).
    moduleName: { type: String, default: "" },
    description: { type: String, default: "" },
    color: { type: String, default: "#1F5E4A" },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
