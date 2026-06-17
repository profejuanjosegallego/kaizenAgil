import mongoose from "mongoose";
import { ROLE_VALUES, ROLES } from "@/lib/constants";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.ESTUDIANTE },
    avatarColor: { type: String, default: "#1F5E4A" },
    // Los estudiantes quedan aprobados al instante; los docentes requieren
    // autorizacion del superadmin (queda en false hasta que lo aprueben).
    approved: { type: Boolean, default: true },
    // Unico usuario que puede autorizar nuevos docentes.
    superAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
