# Kaizen · Gestión ágil de proyectos

> _Mejora continua, un sprint a la vez._

App full-stack (Next.js + MongoDB) para gestionar proyectos académicos: el
**docente** crea proyectos con objetivos, equipos e integrantes; cada proyecto
tiene un **tablero Kanban** con drag & drop (Por hacer → En proceso → Bloqueo →
Terminado), historias de usuario y un **dashboard de métricas** (quién va
excelente / quién se está quemando).

> Multi-proyecto: ReVuelta es solo un proyecto de **ejemplo** que puedes cargar
> con la semilla. Puedes crear los tuyos desde la interfaz.

## Stack

- **Next.js 14** (App Router) + **React 18**
- **MongoDB** + **Mongoose**
- **Tailwind CSS** + tipografía **Inter**
- Auth propia con **JWT** (cookie httpOnly) y **bcrypt**
- **Recharts** para las gráficas, **@hello-pangea/dnd** para el drag & drop

## Arquitectura por capas (backend)

```
app/api/**         → controladores (rutas REST)
lib/apiHandler.js  → manejador central de errores
lib/services/**    → lógica de negocio
lib/repositories/**→ acceso a datos (Mongoose)
lib/dto/**         → mappers documento → respuesta de API
lib/validators/**  → validación de entrada
models/**          → esquemas (modelos) de Mongo
```

## Puesta en marcha

1. **Instala dependencias** (ya hecho si ves `node_modules`):
   ```bash
   npm install
   ```

2. **Configura el entorno**: copia `.env.example` a `.env.local` y rellena:
   ```bash
   cp .env.example .env.local
   ```
   - `MONGODB_URI`: tu cadena de conexión de MongoDB Atlas.
   - `JWT_SECRET`: genera uno con
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

3. **(Opcional) Carga el proyecto de ejemplo** ReVuelta con 5 equipos, 18
   estudiantes y sus HUs por capa:
   ```bash
   npm run seed
   ```

4. **Arranca en desarrollo**:
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000

## Cuentas

- El **docente** se crea con la semilla (variables `SEED_ADMIN_*`) o registrándose
  en `/login` (el registro público crea cuentas de docente).
- Los **estudiantes** se agregan desde un proyecto (pestaña *Equipo y objetivos*);
  si el correo no existe, se les crea una cuenta con contraseña inicial
  `cambiar123`.

## Despliegue en Vercel

1. Sube esta carpeta a un repositorio.
2. Importa el proyecto en Vercel.
3. Define las variables `MONGODB_URI` y `JWT_SECRET` en el panel de Vercel.
4. Deploy. (La semilla se corre aparte con `npm run seed` desde tu máquina.)
