/**
 * Errores de aplicacion. Cada uno lleva su codigo HTTP para que el
 * manejador central (apiHandler) responda de forma consistente.
 */
export class AppError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos invalidos", details = null) {
    super(message, 422, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tienes permisos para esta accion") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con el estado actual") {
    super(message, 409);
    this.name = "ConflictError";
  }
}
