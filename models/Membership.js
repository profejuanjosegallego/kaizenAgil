import mongoose from "mongoose";

/**
 * Relaciona un usuario con un proyecto (y opcionalmente un equipo).
 * Un mismo usuario puede pertenecer a varios proyectos.
 */
const MembershipSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    // Scrum Master del equipo: puede asignar responsables a las HUs de SU equipo.
    scrumMaster: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Un usuario no puede estar duplicado dentro del mismo proyecto.
MembershipSchema.index({ project: 1, user: 1 }, { unique: true });

export default mongoose.models.Membership ||
  mongoose.model("Membership", MembershipSchema);
