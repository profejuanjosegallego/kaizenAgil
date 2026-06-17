import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { AppError } from "@/lib/errors";

/**
 * Envuelve un handler de ruta y centraliza el manejo de errores.
 * Asi cada controlador solo se preocupa por su logica y lanza errores;
 * aqui se traducen a respuestas HTTP coherentes.
 */
export function apiHandler(handler) {
  return async (request, context) => {
    try {
      const result = await handler(request, context);
      // Si el handler ya devolvio una Response/NextResponse, la respetamos.
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

export function toErrorResponse(err) {
  // Error controlado por nosotros.
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.message, details: err.details ?? undefined },
      { status: err.status }
    );
  }

  // Error de validacion de Mongoose.
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
    return NextResponse.json(
      { error: "Datos invalidos", details },
      { status: 422 }
    );
  }

  // Clave duplicada (indice unique).
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || { campo: "" })[0];
    return NextResponse.json(
      { error: `Ya existe un registro con ese ${field}` },
      { status: 409 }
    );
  }

  // Cualquier otra cosa: error 500 sin filtrar detalles internos.
  console.error("[API ERROR]", err);
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  );
}
