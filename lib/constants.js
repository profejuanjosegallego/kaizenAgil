// Roles globales del usuario en la plataforma.
export const ROLES = {
  DOCENTE: "docente",
  ESTUDIANTE: "estudiante",
};
export const ROLE_VALUES = Object.values(ROLES);

// Estados (columnas) del tablero. El orden define como se pintan.
export const STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  BLOCKED: "blocked",
  DONE: "done",
};
export const STATUS_VALUES = Object.values(STATUS);

export const STATUS_META = {
  [STATUS.TODO]: { label: "Por hacer", color: "#64748B", order: 0 },
  [STATUS.IN_PROGRESS]: { label: "En proceso", color: "#2563EB", order: 1 },
  [STATUS.BLOCKED]: { label: "Bloqueo", color: "#DC2626", order: 2 },
  [STATUS.DONE]: { label: "Terminado", color: "#0D9488", order: 3 },
};

// Tipo de historia: ayuda a garantizar que cada estudiante toque cada capa.
export const STORY_TYPE = {
  BD: "bd",
  MODELO: "modelo",
  REPOSITORIO: "repositorio",
  SERVICIO: "servicio",
  DTO: "dto",
  CONTROLADOR: "controlador",
  VALIDACION: "validacion",
  EXCEPCIONES: "excepciones",
  FRONTEND: "frontend",
  OTRO: "otro",
};
export const STORY_TYPE_VALUES = Object.values(STORY_TYPE);

export const STORY_TYPE_META = {
  [STORY_TYPE.BD]: { label: "Diseño BD", color: "#1E3A8A" },
  [STORY_TYPE.MODELO]: { label: "Modelo / Entidad", color: "#1D4ED8" },
  [STORY_TYPE.REPOSITORIO]: { label: "Repositorio JPA", color: "#2563EB" },
  [STORY_TYPE.SERVICIO]: { label: "Servicio", color: "#1E40AF" },
  [STORY_TYPE.DTO]: { label: "DTO / Mapper", color: "#4338CA" },
  [STORY_TYPE.CONTROLADOR]: { label: "Controlador REST", color: "#0E7490" },
  [STORY_TYPE.VALIDACION]: { label: "Validación", color: "#3B82F6" },
  [STORY_TYPE.EXCEPCIONES]: { label: "Manejo de errores", color: "#0369A1" },
  [STORY_TYPE.FRONTEND]: { label: "Frontend React", color: "#0EA5E9" },
  [STORY_TYPE.OTRO]: { label: "Otro", color: "#64748B" },
};

// Agrupacion alto nivel: cada HU es de FRONT o de BACK (color para distinguir).
export const STORY_GROUP = { FRONT: "front", BACK: "back" };
export const STORY_GROUP_META = {
  [STORY_GROUP.BACK]: { label: "Back", color: "#1D4ED8" },
  [STORY_GROUP.FRONT]: { label: "Front", color: "#0EA5E9" },
};
export function storyGroup(type) {
  return type === STORY_TYPE.FRONTEND ? STORY_GROUP.FRONT : STORY_GROUP.BACK;
}

export const PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};
export const PRIORITY_VALUES = Object.values(PRIORITY);

export const PRIORITY_META = {
  [PRIORITY.LOW]: { label: "Baja", color: "#8a948c" },
  [PRIORITY.MEDIUM]: { label: "Media", color: "#F2A03D" },
  [PRIORITY.HIGH]: { label: "Alta", color: "#E8643C" },
};

// Paleta (tonos fríos/azules) para distinguir cada equipo.
export const TEAM_COLORS = [
  "#2563EB", // azul
  "#0EA5E9", // sky
  "#0D9488", // teal
  "#6366F1", // indigo
  "#1E3A8A", // navy
  "#0891B2", // cyan
  "#7C3AED", // violeta
  "#0284C7", // azul intenso
];
