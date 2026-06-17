import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Conexion a MongoDB con cache global.
 * En Next.js los modulos se recargan en caliente y las funciones serverless
 * se invocan muchas veces; cacheamos la conexion para no abrir una nueva en
 * cada request.
 */
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Falta la variable MONGODB_URI. Copia .env.example a .env.local y agrega tu cadena de conexion."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
