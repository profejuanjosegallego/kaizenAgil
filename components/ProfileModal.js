"use client";

import { useState } from "react";
import { api } from "@/components/api";
import { toast } from "@/components/toast";
import { Modal, PasswordInput } from "@/components/ui";
import { User, KeyRound } from "@/components/icons";

/**
 * "Mi cuenta": permite a cualquier usuario corregir su nombre y cambiar su
 * contraseña. Cada sección guarda por separado.
 */
export default function ProfileModal({ user, onClose, onUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const [pw, setPw] = useState({ newPassword: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const setPwField = (k) => (e) => setPw((f) => ({ ...f, [k]: e.target.value }));

  async function saveName() {
    setNameError("");
    if (name.trim().length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
      return;
    }
    setSavingName(true);
    try {
      const { user: updated } = await api.patch("/api/auth/me", { name: name.trim() });
      onUpdated && onUpdated(updated);
      toast.success("Nombre actualizado");
    } catch (err) {
      setNameError(err.message);
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword() {
    setPwError("");
    if (pw.newPassword.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwError("Las contraseñas no coinciden");
      return;
    }
    setSavingPw(true);
    try {
      await api.patch("/api/auth/password", { newPassword: pw.newPassword });
      toast.success("Contraseña actualizada");
      setPw({ newPassword: "", confirm: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  const nameDirty = name.trim() !== (user?.name || "").trim();

  return (
    <Modal
      open
      onClose={onClose}
      title="Mi cuenta"
      footer={
        <button className="btn-pine" onClick={onClose}>
          Listo
        </button>
      }
    >
      <div className="space-y-6">
        {/* Nombre */}
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
            <User size={15} className="text-pine" /> Tu nombre
          </h4>
          <p className="mb-2 rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink/60">
            Así te ven en los tableros y métricas. Corrígelo si quedó mal escrito.
          </p>
          <div className="flex gap-2">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
            />
            <button
              className="btn-pine whitespace-nowrap"
              onClick={saveName}
              disabled={savingName || !nameDirty || !name.trim()}
            >
              {savingName ? "Guardando…" : "Guardar"}
            </button>
          </div>
          {nameError && <p className="mt-1 text-sm font-medium text-clay">{nameError}</p>}
        </section>

        <div className="h-px bg-line" />

        {/* Contraseña */}
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
            <KeyRound size={15} className="text-pine" /> Cambiar contraseña
          </h4>
          <p className="mb-2 rounded-lg bg-paper-2 px-3 py-2 text-xs text-ink/60">
            Escribe tu nueva contraseña dos veces. No necesitas la anterior.
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">Nueva contraseña</label>
              <PasswordInput
                value={pw.newPassword}
                onChange={setPwField("newPassword")}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Repite la nueva contraseña</label>
              <PasswordInput
                value={pw.confirm}
                onChange={setPwField("confirm")}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>
            <button
              className="btn-pine w-full"
              onClick={savePassword}
              disabled={savingPw || !pw.newPassword || !pw.confirm}
            >
              {savingPw ? "Guardando…" : "Actualizar contraseña"}
            </button>
            {pwError && <p className="text-sm font-medium text-clay">{pwError}</p>}
          </div>
        </section>
      </div>
    </Modal>
  );
}
