import User from "@/models/User";

export const userRepository = {
  findById(userId) {
    return User.findById(userId);
  },
  findByEmail(email, withPassword = false) {
    const q = User.findOne({ email: String(email).toLowerCase().trim() });
    return withPassword ? q.select("+passwordHash") : q;
  },
  findByIdWithPassword(userId) {
    return User.findById(userId).select("+passwordHash");
  },
  updatePassword(userId, passwordHash) {
    return User.findByIdAndUpdate(userId, { passwordHash }, { new: true });
  },
  create(data) {
    return User.create(data);
  },
  findByIds(ids) {
    return User.find({ _id: { $in: ids } });
  },
  listPendingDocentes() {
    return User.find({ role: "docente", approved: false }).sort({ createdAt: 1 });
  },
  listStudents() {
    return User.find({ role: "estudiante" }).sort({ name: 1 });
  },
  listDocentes() {
    // Docentes activos (ya autorizados). Los pendientes van en su propia lista.
    return User.find({ role: "docente", approved: true }).sort({ name: 1 });
  },
  update(userId, data) {
    return User.findByIdAndUpdate(userId, data, { new: true });
  },
  remove(userId) {
    return User.findByIdAndDelete(userId);
  },
};
