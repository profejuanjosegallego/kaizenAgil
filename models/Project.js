import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    // Lista de objetivos del proyecto (texto libre, uno por item).
    objectives: { type: [String], default: [] },
    color: { type: String, default: "#1F5E4A" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
