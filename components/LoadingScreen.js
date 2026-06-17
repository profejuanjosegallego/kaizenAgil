/**
 * Pantalla de carga con mensaje. Sin hooks: se puede usar tanto en los
 * archivos loading.js (servidor) como dentro de componentes cliente.
 * Con overlay=true se muestra encima del contenido (semitransparente).
 */
export default function LoadingScreen({ message = "Cargando…", overlay = false }) {
  const wrap = overlay
    ? "fixed inset-0 z-50 bg-paper/80 backdrop-blur-sm"
    : "min-h-screen bg-paper";
  return (
    <div className={`grid place-items-center ${wrap}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl font-extrabold tracking-tight text-ink">
          Kaizen<span className="text-clay">·</span>
        </div>
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-pine" />
        <p className="text-sm font-medium text-ink/60">{message}</p>
      </div>
    </div>
  );
}
