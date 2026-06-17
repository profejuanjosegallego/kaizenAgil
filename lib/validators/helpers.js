import { ValidationError } from "@/lib/errors";

/**
 * Helpers de validacion ligeros (sin dependencias externas).
 * Cada funcion acumula errores y, si hay alguno, lanza ValidationError.
 */
export function createValidator() {
  const errors = {};
  const api = {
    require(field, value, label) {
      if (value === undefined || value === null || String(value).trim() === "") {
        errors[field] = `${label || field} es obligatorio`;
      }
      return api;
    },
    string(field, value, label, { min = 0, max = Infinity } = {}) {
      if (value === undefined || value === null) return api;
      const v = String(value);
      if (v.length < min) errors[field] = `${label || field} debe tener al menos ${min} caracteres`;
      if (v.length > max) errors[field] = `${label || field} no puede superar ${max} caracteres`;
      return api;
    },
    email(field, value, label) {
      if (!value) return api;
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      if (!ok) errors[field] = `${label || field} no es un correo valido`;
      return api;
    },
    oneOf(field, value, allowed, label) {
      if (value === undefined || value === null) return api;
      if (!allowed.includes(value)) {
        errors[field] = `${label || field} no es un valor permitido`;
      }
      return api;
    },
    number(field, value, label, { min = -Infinity, max = Infinity } = {}) {
      if (value === undefined || value === null || value === "") return api;
      const n = Number(value);
      if (Number.isNaN(n)) {
        errors[field] = `${label || field} debe ser un numero`;
      } else if (n < min || n > max) {
        errors[field] = `${label || field} debe estar entre ${min} y ${max}`;
      }
      return api;
    },
    custom(field, condition, message) {
      if (!condition) errors[field] = message;
      return api;
    },
    throwIfInvalid() {
      if (Object.keys(errors).length > 0) {
        throw new ValidationError("Revisa los campos del formulario", errors);
      }
    },
  };
  return api;
}

/** Genera un slug url-safe a partir de un texto. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
