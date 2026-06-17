"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/api";
import { PasswordInput } from "@/components/ui";
import LoadingScreen from "@/components/LoadingScreen";
import { Kanban, MousePointerClick, ChartColumn, ShieldCheck, GraduationCap, School, ExternalLink } from "@/components/icons";

const REVUELTA_URL = "https://re-vuelta.vercel.app/";
import { ROLES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

const FEATURES = [
  { icon: Kanban, label: "Tablero ágil" },
  { icon: MousePointerClick, label: "Arrastrar y soltar" },
  { icon: ChartColumn, label: "Métricas" },
  { icon: ShieldCheck, label: "Roles y permisos" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/proyectos";

  const [mode, setMode] = useState("login"); // login | register | forgot
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.ESTUDIANTE,
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        await api.post("/api/auth/forgot", { email: form.email });
        setMode("login");
        setInfo(
          "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja (y spam)."
        );
        setForm((f) => ({ ...f, password: "" }));
        setLoading(false);
        return;
      }
      if (mode === "register") {
        const res = await api.post("/api/auth/register", form);
        // Los docentes quedan pendientes de autorización: no inician sesión aún.
        if (form.role === ROLES.DOCENTE && !res.approved) {
          setMode("login");
          setInfo(
            "Tu cuenta de docente se creó y está pendiente de autorización por el administrador. Podrás entrar cuando la apruebe."
          );
          setForm((f) => ({ ...f, password: "" }));
          setLoading(false);
          return;
        }
      }
      await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      router.push(next);
      router.refresh();
      // No quitamos el overlay aquí: se mantiene "Iniciando sesión…" hasta que
      // la navegación cambie de página (evita que reaparezca el formulario).
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {loading && (
        <LoadingScreen
          overlay
          message={
            mode === "login"
              ? "Iniciando sesión…"
              : mode === "forgot"
              ? "Enviando enlace…"
              : "Creando cuenta…"
          }
        />
      )}

      {/* Panel de marca */}
      <section className="relative hidden flex-col justify-between bg-pine p-10 text-paper lg:flex">
        <div className="text-xl font-extrabold tracking-tight">
          Kaizen<span className="text-marigold">·</span>
        </div>
        <div>
          <p className="mb-2 font-mono text-sm uppercase tracking-[0.2em] text-marigold">
            Mejora continua, un sprint a la vez
          </p>
          <h1 className="text-4xl font-extrabold leading-tight">
            Gestiona tus proyectos
            <br />
            de clase como un equipo real.
          </h1>
          <p className="mt-4 max-w-md text-paper/80">
            Crea proyectos, define objetivos y equipos, reparte historias de
            usuario y mira en vivo quién avanza y quién necesita apoyo.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper/30 px-3 py-1 font-medium"
                >
                  <Icon size={15} aria-hidden />
                  {f.label}
                </span>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-paper/60">
          Herramienta académica · desarrollada por el Prof. Juan José Gallego Mesa, M.Sc.
        </p>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="text-xl font-extrabold text-ink">
              Kaizen<span className="text-clay">·</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink">
            {mode === "login"
              ? "Inicia sesión"
              : mode === "forgot"
              ? "Recuperar contraseña"
              : "Crea tu cuenta"}
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            {mode === "login"
              ? "Entra para ver tus tableros."
              : mode === "forgot"
              ? "Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña."
              : "Regístrate como estudiante o como docente."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="label">Soy</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: ROLES.ESTUDIANTE, label: "Estudiante", Icon: GraduationCap },
                      { value: ROLES.DOCENTE, label: "Docente", Icon: School },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          form.role === opt.value
                            ? "border-pine bg-pine/10 text-pine"
                            : "border-line text-ink/60 hover:border-pine/50"
                        }`}
                      >
                        <opt.Icon size={16} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {form.role === ROLES.DOCENTE && (
                    <p className="mt-1.5 text-xs text-ink/55">
                      Las cuentas de docente requieren autorización del
                      administrador antes de poder entrar.
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Nombre</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="label">Correo</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Contraseña</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="mb-1 text-xs font-semibold text-pine hover:text-clay"
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setInfo("");
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <PasswordInput
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm font-medium text-clay">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-pine/10 px-3 py-2 text-sm font-medium text-pine">
                {info}
              </p>
            )}

            <button className="btn-pine w-full" disabled={loading}>
              {loading
                ? "Procesando…"
                : mode === "login"
                ? "Entrar"
                : mode === "forgot"
                ? "Enviar enlace"
                : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            {mode === "forgot" ? (
              <button
                className="font-semibold text-pine hover:text-clay"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfo("");
                }}
              >
                ← Volver a iniciar sesión
              </button>
            ) : (
              <>
                {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <button
                  className="font-semibold text-pine hover:text-clay"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setInfo("");
                  }}
                >
                  {mode === "login" ? "Regístrate" : "Inicia sesión"}
                </button>
              </>
            )}
          </p>

          <a
            href={REVUELTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper-2/50 px-3 py-2 text-xs font-semibold text-pine hover:border-pine hover:text-clay"
          >
            <ExternalLink size={14} /> Conoce el proyecto ReVuelta
          </a>
        </div>
      </section>
    </main>
  );
}
