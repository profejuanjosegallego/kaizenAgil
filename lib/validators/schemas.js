import { createValidator } from "./helpers";
import {
  ROLE_VALUES,
  STATUS_VALUES,
  STORY_TYPE_VALUES,
  PRIORITY_VALUES,
} from "@/lib/constants";

export function validateLogin(body) {
  const v = createValidator();
  v.require("email", body.email, "Correo").email("email", body.email, "Correo");
  v.require("password", body.password, "Contraseña");
  v.throwIfInvalid();
  return { email: String(body.email).toLowerCase().trim(), password: body.password };
}

export function validateUser(body) {
  const v = createValidator();
  v.require("name", body.name, "Nombre").string("name", body.name, "Nombre", { max: 80 });
  v.require("email", body.email, "Correo").email("email", body.email, "Correo");
  v.require("password", body.password, "Contraseña").string("password", body.password, "Contraseña", { min: 6, max: 100 });
  v.oneOf("role", body.role, ROLE_VALUES, "Rol");
  v.throwIfInvalid();
  return {
    name: String(body.name).trim(),
    email: String(body.email).toLowerCase().trim(),
    password: body.password,
    role: body.role,
  };
}

export function validateProject(body) {
  const v = createValidator();
  v.require("name", body.name, "Nombre del proyecto").string("name", body.name, "Nombre", { max: 100 });
  v.string("description", body.description, "Descripción", { max: 2000 });
  v.throwIfInvalid();
  return {
    name: String(body.name).trim(),
    description: body.description ? String(body.description).trim() : "",
    objectives: Array.isArray(body.objectives)
      ? body.objectives.map((o) => String(o).trim()).filter(Boolean)
      : [],
    color: body.color || "#1F5E4A",
  };
}

export function validateTeam(body) {
  const v = createValidator();
  v.require("name", body.name, "Nombre del equipo").string("name", body.name, "Nombre", { max: 80 });
  v.throwIfInvalid();
  return {
    name: String(body.name).trim(),
    moduleName: body.moduleName ? String(body.moduleName).trim() : "",
    description: body.description ? String(body.description).trim() : "",
    color: body.color || "#1F5E4A",
  };
}

export function validateStoryCreate(body) {
  const v = createValidator();
  v.require("title", body.title, "Título").string("title", body.title, "Título", { max: 160 });
  v.oneOf("type", body.type, STORY_TYPE_VALUES, "Tipo");
  v.oneOf("status", body.status, STATUS_VALUES, "Estado");
  v.oneOf("priority", body.priority, PRIORITY_VALUES, "Prioridad");
  v.number("points", body.points, "Puntos", { min: 0, max: 100 });
  v.throwIfInvalid();
  return cleanStory(body);
}

export function validateStoryUpdate(body) {
  const v = createValidator();
  if (body.title !== undefined) v.require("title", body.title, "Título");
  if (body.type !== undefined) v.oneOf("type", body.type, STORY_TYPE_VALUES, "Tipo");
  if (body.status !== undefined) v.oneOf("status", body.status, STATUS_VALUES, "Estado");
  if (body.priority !== undefined) v.oneOf("priority", body.priority, PRIORITY_VALUES, "Prioridad");
  if (body.points !== undefined) v.number("points", body.points, "Puntos", { min: 0, max: 100 });
  v.throwIfInvalid();
  return cleanStory(body, true);
}

export function validateMove(body) {
  const v = createValidator();
  v.require("status", body.status, "Estado").oneOf("status", body.status, STATUS_VALUES, "Estado");
  v.number("order", body.order, "Orden", { min: 0 });
  v.throwIfInvalid();
  return {
    status: body.status,
    order: Number(body.order ?? 0),
    blockedReason: body.blockedReason ? String(body.blockedReason).trim() : "",
  };
}

function cleanStory(body, partial = false) {
  const out = {};
  const assign = (k, val) => {
    if (!partial || body[k] !== undefined) out[k] = val;
  };
  assign("title", body.title ? String(body.title).trim() : "");
  assign("code", body.code ? String(body.code).trim() : "");
  assign("description", body.description ? String(body.description).trim() : "");
  assign(
    "acceptanceCriteria",
    Array.isArray(body.acceptanceCriteria)
      ? body.acceptanceCriteria.map((c) => String(c).trim()).filter(Boolean)
      : []
  );
  assign("type", body.type);
  assign("status", body.status);
  assign("priority", body.priority);
  assign("points", body.points !== undefined ? Number(body.points) : 1);
  if (body.teamId !== undefined) out.team = body.teamId || null;
  if (body.assigneeId !== undefined) out.assignee = body.assigneeId || null;
  if (body.blockedReason !== undefined) out.blockedReason = String(body.blockedReason || "").trim();
  if (body.dueDate !== undefined) out.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  return out;
}
