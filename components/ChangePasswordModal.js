"use client";

import { useState } from "react";
import { api } from "@/components/api";
import { toast } from "@/components/toast";
import { Modal, PasswordInput } from "@/components/ui";

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    setError("");
    if (form.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/api/auth/password", { newPassword: form.newPassword });
      toast.success("Contraseña actualizada");
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Cambiar contraseña"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-pine" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink/60">
          Escribe tu nueva contraseña dos veces. No necesitas la anterior.
        </p>
        <div>
          <label className="label">Nueva contraseña</label>
          <PasswordInput
            value={form.newPassword}
            onChange={set("newPassword")}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label">Repite la nueva contraseña</label>
          <PasswordInput
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Repite la nueva contraseña"
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm font-medium text-clay">{error}</p>}
      </div>
    </Modal>
  );
}
