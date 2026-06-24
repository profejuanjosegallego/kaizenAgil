/* eslint-disable no-console */
/**
 * Semilla de datos. Crea (o recrea) un proyecto de EJEMPLO: "ReVuelta".
 * - 1 docente administrador (de las variables SEED_ADMIN_*)
 * - 5 equipos de estudiantes (18 tablas) + 1 equipo común "Autenticación"
 *   con la entidad Usuario, que modela el docente como ejemplo.
 * - HUs en "Por hacer", agrupadas por capa:
 *     · MODELO: 1 por tabla (18) + Usuario (ejemplo del docente) = 19
 *     · REPOSITORIO JPA con consultas personalizadas: 1 por tabla (18)
 *       + Usuario (ejemplo del docente) = 19
 *   Cada HU usa los campos y relaciones reales de su tabla y trae criterios
 *   de aceptación y estimación (puntos). La entidad Usuario y sus HUs quedan
 *   asignadas al docente.
 *
 * IDEMPOTENTE: por defecto actualiza el CONTENIDO de las HUs por su `code` y
 * CONSERVA el progreso (responsable, estado, orden, fechas) y las membresías de
 * los estudiantes. Las HUs nuevas (p. ej. de capas futuras) entran en "Por
 * hacer". Ideal para ir agregando HUs sin perder lo que el equipo ya avanzó.
 *
 * Uso:  npm run seed          (conserva progreso — recomendado)
 *       npm run seed:reset    (borra y recrea TODO desde cero)
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { MONGODB_URI } = process.env;
const ADMIN = {
  name: process.env.SEED_ADMIN_NAME || "Docente",
  email: (process.env.SEED_ADMIN_EMAIL || "docente@revuelta.edu").toLowerCase(),
  password: process.env.SEED_ADMIN_PASSWORD || "cambiar123",
};

if (!MONGODB_URI) {
  console.error("✖ Falta MONGODB_URI en .env.local");
  process.exit(1);
}

const opts = { timestamps: true, strict: false };
const User = mongoose.model("User", new mongoose.Schema({}, opts));
const Project = mongoose.model("Project", new mongoose.Schema({}, opts));
const Team = mongoose.model("Team", new mongoose.Schema({}, opts));
const Membership = mongoose.model("Membership", new mongoose.Schema({}, opts));
const Story = mongoose.model("Story", new mongoose.Schema({}, opts));

const COLORS = ["#2563EB", "#0EA5E9", "#0D9488", "#6366F1", "#1E3A8A", "#0891B2", "#7C3AED", "#0284C7"];

// ---- Equipos, estudiantes y sus tablas (con campos y relaciones) ----
const TEAMS = [
  {
    name: "Equipo 1 · Catálogo",
    moduleName: "Catálogo e Inventario de Prendas",
    prefix: "CAT",
    color: "#2563EB",
    students: [
      { name: "Ahumada Roldan Daniel", table: "prendas", fields: ["id", "titulo", "descripcion", "talla", "precio", "fecha_publicacion", "disponible"], relations: ["id_categoria → categorias", "id_estado → estados_prenda", "id_vendedor → usuarios"] },
      { name: "Gil Pérez Jonatan Stiven", table: "categorias", fields: ["id", "nombre", "descripcion", "slug", "icono", "activa", "orden"], relations: [] },
      { name: "Mejía Corrales Andres Felipe", table: "imagenes_prenda", fields: ["id", "url", "es_principal", "orden", "formato", "tamaño_kb", "fecha_subida"], relations: ["id_prenda → prendas"] },
      { name: "Salazar Arango John Alexander", table: "estados_prenda", fields: ["id", "nombre", "descripcion", "nivel_desgaste", "color_etiqueta", "requiere_revision", "activo"], relations: [] },
    ],
  },
  {
    name: "Equipo 2 · Marketplace",
    moduleName: "Marketplace y Transacciones",
    prefix: "MKT",
    color: "#0EA5E9",
    students: [
      { name: "Gaviria Gómez Juan Felipe", table: "pedidos", fields: ["id", "fecha", "estado", "total", "metodo_pago", "direccion_entrega", "notas"], relations: ["id_comprador → usuarios"] },
      { name: "Toro Palacio José David", table: "detalle_pedido", fields: ["id", "cantidad", "precio_unitario", "subtotal", "descuento", "estado_item", "fecha"], relations: ["id_pedido → pedidos", "id_prenda → prendas"] },
      { name: "Valencia Tobón Jhon Deiby", table: "transacciones", fields: ["id", "tipo", "monto", "estado", "referencia_pago", "fecha", "comprobante"], relations: ["id_pedido → pedidos"] },
      { name: "Villa Carmona Andres Felipe", table: "trueques", fields: ["id", "estado", "fecha_propuesta", "fecha_respuesta", "mensaje", "valor_estimado", "aceptado"], relations: ["id_prenda_ofrecida → prendas", "id_prenda_deseada → prendas", "id_proponente → usuarios"] },
    ],
  },
  {
    name: "Equipo 3 · Logística",
    moduleName: "Logística y Distribución",
    prefix: "LOG",
    color: "#0D9488",
    students: [
      { name: "Chávez Acosta Ever Andrés", table: "envios", fields: ["id", "codigo_guia", "estado", "costo", "fecha_despacho", "fecha_entrega_estimada", "peso_kg"], relations: ["id_pedido → pedidos", "id_transportista → transportistas", "id_punto_acopio → puntos_acopio"] },
      { name: "Mendez Hawasly Johan David", table: "puntos_acopio", fields: ["id", "nombre", "direccion", "ciudad", "horario", "capacidad", "activo"], relations: [] },
      { name: "Ortiz Arteaga Carolina", table: "seguimiento_envio", fields: ["id", "estado", "descripcion", "ubicacion", "fecha_hora", "latitud", "longitud"], relations: ["id_envio → envios"] },
      { name: "Trujillo Roldán David Alejandro", table: "transportistas", fields: ["id", "nombre", "tipo_vehiculo", "placa", "telefono", "zona_cobertura", "disponible"], relations: [] },
    ],
  },
  {
    name: "Equipo 4 · Mercadeo",
    moduleName: "Mercadeo, Promociones y Fidelización",
    prefix: "MER",
    color: "#6366F1",
    students: [
      { name: "Alzate Grajales Alejandro", table: "campañas", fields: ["id", "nombre", "descripcion", "fecha_inicio", "fecha_fin", "descuento_pct", "activa"], relations: [] },
      { name: "Aristizábal Londoño Alejandro", table: "cupones", fields: ["id", "codigo", "tipo", "valor", "usos_maximos", "usos_actuales", "fecha_expiracion"], relations: ["id_campaña → campañas"] },
      { name: "Torres Rodríguez Juan Esteban", table: "recompensas", fields: ["id", "nombre", "puntos_requeridos", "descripcion", "stock", "tipo", "activa"], relations: [] },
    ],
  },
  {
    name: "Equipo 5 · Comunidad",
    moduleName: "Comunidad, Reputación y Valoraciones",
    prefix: "COM",
    color: "#1E3A8A",
    students: [
      { name: "Castaño Ocampo Mauricio", table: "reseñas", fields: ["id", "comentario", "titulo", "fecha", "recomendado", "editada", "visible"], relations: ["id_autor → usuarios", "id_usuario_reseñado → usuarios"] },
      { name: "Gudelo Niño Diego Alejandro", table: "calificaciones", fields: ["id", "puntaje", "dimension", "comentario_corto", "fecha", "verificada", "peso"], relations: ["id_reseña → reseñas"] },
      { name: "Zapata Barrera Juan David", table: "reportes", fields: ["id", "motivo", "descripcion", "estado", "prioridad", "fecha", "resuelto"], relations: ["id_reportante → usuarios", "id_prenda → prendas"] },
    ],
  },
];

function pascal(table) {
  return table
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

// Tipo de dato Java/JPA sugerido según el nombre del campo.
function javaType(f) {
  if (f === "id") return "UUID";
  if (/^(disponible|es_principal|activa|activo|recomendado|editada|visible|verificada|requiere_revision|aceptado|resuelto)$/.test(f))
    return "Boolean";
  if (f === "fecha_hora") return "LocalDateTime";
  if (/^fecha/.test(f)) return "LocalDate";
  // Dinero y decimales en general → Double (más simple para los estudiantes).
  if (/^(precio|total|subtotal|precio_unitario|monto|valor_estimado|costo|descuento|peso_kg|latitud|longitud|descuento_pct)$/.test(f))
    return "Double";
  if (/^(cantidad|orden|capacidad|usos_maximos|usos_actuales|puntos_requeridos|stock|nivel_desgaste|puntaje|peso|tamaño_kb)$/.test(f))
    return "Integer";
  return "String";
}

// snake_case → camelCase: "fecha_publicacion" → "fechaPublicacion".
function camel(s) {
  return s
    .split("_")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Propiedad de la relación a partir de la llave foránea: "id_prenda" → "prenda".
function relProp(fk) {
  return camel(fk.replace(/^id_/, ""));
}

// La entidad Usuario es el módulo común de Autenticación. La modela el DOCENTE
// como ejemplo en clase. Otras tablas la referencian (FK), así que aquí las
// relaciones son inversas (@OneToMany).
const USUARIO = {
  table: "usuarios",
  fields: ["id", "nombre", "correo", "contraseña_hash", "rol", "activo", "color_avatar", "fecha_registro"],
  // Cómo se ven los campos ya tipados (fecha_registro es un instante → LocalDateTime).
  fieldsTyped:
    "nombre (String), correo (String), contraseña_hash (String), rol (String), activo (Boolean), color_avatar (String), fecha_registro (LocalDateTime)",
  inverseRelations: [
    { Entity: "Prenda", mappedBy: "vendedor", desc: "prendas publicadas por el usuario" },
    { Entity: "Pedido", mappedBy: "comprador", desc: "pedidos realizados por el usuario" },
    { Entity: "Trueque", mappedBy: "proponente", desc: "trueques propuestos por el usuario" },
    { Entity: "Reseña", mappedBy: "autor", desc: "reseñas escritas por el usuario" },
    { Entity: "Reporte", mappedBy: "reportante", desc: "reportes hechos por el usuario" },
  ],
};

/**
 * Genera consultas personalizadas (métodos derivados de Spring Data) acordes a
 * los campos y relaciones reales de cada tabla. Devuelve [{ sig, desc }].
 * Se limita a 5 para que la HU no quede demasiado larga.
 */
function derivedQueries(st, relList, Entity) {
  const fields = st.fields;
  const has = (f) => fields.includes(f);
  const out = [];

  // Por la entidad relacionada (lo más frecuente: "dame los X de esta Y").
  relList.forEach((r) => {
    const prop = relProp(r.fk);
    out.push({
      sig: `List<${Entity}> findBy${cap(prop)}(${r.Entity} ${prop})`,
      desc: `lista los registros asociados a una ${r.Entity}`,
    });
  });

  // Búsqueda parcial por un campo de texto representativo.
  const textField = ["titulo", "nombre", "codigo", "codigo_guia", "slug"].find(has);
  if (textField) {
    out.push({
      sig: `List<${Entity}> findBy${cap(camel(textField))}ContainingIgnoreCase(String ${camel(textField)})`,
      desc: `búsqueda parcial por ${textField}, sin distinguir mayúsculas y minúsculas`,
    });
  }

  // Por estado.
  if (has("estado")) {
    out.push({ sig: `List<${Entity}> findByEstado(String estado)`, desc: "filtra por estado" });
  }

  // Por un campo booleano (disponibilidad/activación).
  const boolField = fields.find((f) =>
    /^(disponible|activa|activo|recomendado|visible|verificada|aceptado|resuelto|requiere_revision|es_principal|editada)$/.test(f)
  );
  if (boolField) {
    out.push({
      sig: `List<${Entity}> findBy${cap(camel(boolField))}True()`,
      desc: `devuelve solo los que tienen ${boolField} = true`,
    });
  }

  // Por fecha: del más reciente al más antiguo.
  const dateField = fields.find((f) => /^fecha/.test(f));
  if (dateField) {
    out.push({
      sig: `List<${Entity}> findAllByOrderBy${cap(camel(dateField))}Desc()`,
      desc: `ordena del más reciente al más antiguo por ${dateField}`,
    });
  }

  // Por un valor numérico mínimo.
  const numField = ["precio", "total", "monto", "puntaje", "valor_estimado", "costo", "subtotal"].find(has);
  if (numField) {
    out.push({
      sig: `List<${Entity}> findBy${cap(camel(numField))}GreaterThanEqual(Double ${camel(numField)}Minimo)`,
      desc: `filtra por ${numField} mayor o igual al valor recibido`,
    });
  }

  return out.slice(0, 5);
}

// Una consulta con @Query (JPQL) acorde a la tabla, para que practiquen @Param.
function jpqlQuery(st, relList, Entity) {
  const a = Entity.charAt(0).toLowerCase();
  if (relList.length > 0) {
    const r = relList[0];
    const prop = relProp(r.fk);
    return {
      annotation: `@Query("SELECT ${a} FROM ${Entity} ${a} WHERE ${a}.${prop}.id = :${prop}Id")`,
      sig: `List<${Entity}> buscarPor${r.Entity}Id(@Param("${prop}Id") UUID ${prop}Id)`,
      desc: `trae los registros de una ${r.Entity} a partir de su id`,
    };
  }
  if (st.fields.includes("estado")) {
    return {
      annotation: `@Query("SELECT COUNT(${a}) FROM ${Entity} ${a} WHERE ${a}.estado = :estado")`,
      sig: `long contarPorEstado(@Param("estado") String estado)`,
      desc: "cuenta cuántos registros hay en un estado dado",
    };
  }
  const textField = ["nombre", "titulo", "codigo"].find((f) => st.fields.includes(f)) || "nombre";
  return {
    annotation: `@Query("SELECT ${a} FROM ${Entity} ${a} WHERE LOWER(${a}.${camel(textField)}) LIKE LOWER(CONCAT('%', :texto, '%'))")`,
    sig: `List<${Entity}> buscarPor${cap(camel(textField))}(@Param("texto") String texto)`,
    desc: `busca por ${textField} con LIKE (parcial)`,
  };
}

/**
 * Construye SOLO la definición de una HU de "repositorio JPA con consultas
 * personalizadas" (título, descripción, criterios, tipo, prioridad, puntos).
 * Los campos de progreso (responsable, estado, orden…) los pone el upsert.
 */
function buildRepoDef({ st, relList, Entity }) {
  const queries = derivedQueries(st, relList, Entity);
  const jpql = jpqlQuery(st, relList, Entity);
  return {
    title: `Crear el repositorio JPA de \`${Entity}\` con consultas personalizadas`,
    description: `Crea la interfaz \`${Entity}Repository\` que extiende \`JpaRepository<${Entity}, UUID>\` y anótala con @Repository. Además de las operaciones CRUD heredadas (save, findById, findAll, deleteById), define consultas personalizadas con dos técnicas: (1) métodos derivados por nombre (query methods de Spring Data) y (2) al menos una consulta con @Query en JPQL usando @Param. Las consultas deben tener sentido para la tabla \`${st.table}\` según sus campos y relaciones.`,
    acceptanceCriteria: [
      `La interfaz \`${Entity}Repository\` extiende \`JpaRepository<${Entity}, UUID>\` y está anotada con @Repository.`,
      "Se reutilizan las operaciones CRUD heredadas (save, findById, findAll, deleteById) sin volver a programarlas.",
      ...queries.map((q) => `Método derivado (query method): \`${q.sig}\` — ${q.desc}.`),
      `Al menos una consulta con @Query (JPQL): ${jpql.annotation} sobre \`${jpql.sig}\` — ${jpql.desc}.`,
      "Cada consulta personalizada se prueba (desde un test o el servicio) y devuelve los datos esperados.",
    ],
    type: "repositorio",
    priority: "medium",
    points: 3,
  };
}

/**
 * Construye la definición de la HU de modelado de una tabla de estudiante.
 */
function buildModeloDef({ st, relList, Entity }) {
  const fieldsTyped = st.fields
    .filter((f) => f !== "id")
    .map((f) => `${f} (${javaType(f)})`)
    .join(", ");
  const relatedNames = relList.map((x) => x.Entity);
  const relacionaCon =
    relatedNames.length > 0
      ? `Esta entidad SE RELACIONA CON: ${[...new Set(relatedNames)].join(", ")} (con @ManyToOne desde su llave foránea).`
      : "Esta entidad NO se relaciona con otras tablas.";
  const relCriteria =
    relList.length > 0
      ? relList.map(
          (x) =>
            `Relación con \`${x.Entity}\` (tabla ${x.target}): el campo ${x.fk} se mapea como @ManyToOne hacia ${x.Entity}.`
        )
      : ["Esta entidad no se relaciona con otras tablas (no requiere @ManyToOne)."];
  return {
    title: `Modelar la entidad \`${Entity}\` (tabla ${st.table}) en Spring Boot`,
    description: `Crea la clase de entidad JPA que representa la tabla \`${st.table}\`. Anota la clase con @Entity y @Table(name = "${st.table}"). La llave primaria \`id\` es de tipo UUID (con @Id y @GeneratedValue de estrategia UUID). Mapea cada campo con @Column respetando su tipo de dato. ${relacionaCon} Configura esas relaciones con @ManyToOne (y opcionalmente @OneToMany en el lado inverso) y evita las relaciones muchos-a-muchos (@ManyToMany).`,
    acceptanceCriteria: [
      `La clase \`${Entity}\` está anotada con @Entity y @Table(name = "${st.table}").`,
      "El campo id es de tipo UUID, anotado con @Id y @GeneratedValue(strategy = GenerationType.UUID).",
      `Cada campo se mapea con @Column con su tipo de dato: ${fieldsTyped}.`,
      ...relCriteria,
      "No se usan relaciones muchos-a-muchos (@ManyToMany).",
    ],
    type: "modelo",
    priority: "high",
    points: 3,
  };
}

// Definición de la HU de modelado de la entidad Usuario (ejemplo del docente).
function usuarioModeloDef() {
  return {
    title: "Modelar la entidad `Usuario` (tabla usuarios) en Spring Boot — ejemplo del docente",
    description:
      'Ejemplo guiado en clase. Crea la entidad JPA del módulo común de Autenticación. Anota la clase con @Entity y @Table(name = "usuarios"). La llave primaria `id` es UUID (@Id y @GeneratedValue de estrategia UUID). Mapea cada campo con @Column; el `correo` debe ser único (@Column(nullable = false, unique = true)) y el `contraseña_hash` guarda SIEMPRE la contraseña cifrada (nunca en texto plano). Como muchas tablas apuntan a usuarios, aquí las relaciones son INVERSAS: usa @OneToMany(mappedBy = ...) hacia esas entidades.',
    acceptanceCriteria: [
      'La clase `Usuario` está anotada con @Entity y @Table(name = "usuarios").',
      "El campo id es de tipo UUID, anotado con @Id y @GeneratedValue(strategy = GenerationType.UUID).",
      "El correo es único: @Column(nullable = false, unique = true).",
      `Cada campo se mapea con @Column con su tipo de dato: ${USUARIO.fieldsTyped}.`,
      ...USUARIO.inverseRelations.map(
        (r) => `Relación @OneToMany(mappedBy = "${r.mappedBy}") hacia \`${r.Entity}\`: ${r.desc}.`
      ),
      "La contraseña se almacena cifrada (hash con BCrypt), nunca en texto plano.",
    ],
    type: "modelo",
    priority: "high",
    points: 3,
  };
}

// Definición de la HU del repositorio de Usuario (orientado al login).
function usuarioRepoDef() {
  return {
    title: "Crear el repositorio JPA de `Usuario` con consultas personalizadas",
    description:
      "Ejemplo guiado en clase. Crea la interfaz `UsuarioRepository` que extiende `JpaRepository<Usuario, UUID>` y anótala con @Repository. Define las consultas personalizadas que necesita la autenticación: buscar por correo para iniciar sesión, validar que el correo no exista al registrar, listar usuarios activos y filtrar por rol. Combina métodos derivados por nombre y al menos una consulta con @Query (JPQL).",
    acceptanceCriteria: [
      "La interfaz `UsuarioRepository` extiende `JpaRepository<Usuario, UUID>` y está anotada con @Repository.",
      "Método derivado: `Optional<Usuario> findByCorreo(String correo)` — clave para autenticar en el login.",
      "Método derivado: `boolean existsByCorreo(String correo)` — valida correo único al registrar.",
      "Método derivado: `List<Usuario> findByActivoTrue()` — lista solo los usuarios activos.",
      "Método derivado: `List<Usuario> findByRol(String rol)` — filtra por rol (docente/estudiante).",
      'Consulta con @Query (JPQL): @Query("SELECT u FROM Usuario u WHERE LOWER(u.correo) = LOWER(:correo)") sobre `Optional<Usuario> buscarPorCorreo(@Param("correo") String correo)` — búsqueda de correo sin distinguir mayúsculas.',
      "Cada consulta personalizada se prueba (desde un test o el servicio) y devuelve los datos esperados.",
    ],
    type: "repositorio",
    priority: "high",
    points: 3,
  };
}

function slugifyEmail(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "") + "@revuelta.edu"
  );
}

async function run() {
  // Modo RESET: borra y recrea todo el proyecto de ejemplo desde cero (pierde
  // asignaciones y avance). Por defecto la semilla es IDEMPOTENTE: actualiza el
  // contenido de las HUs por código y CONSERVA el progreso (responsable,
  // estado, orden, fechas) y las membresías de los estudiantes.
  const RESET = process.argv.includes("--reset") || process.env.SEED_RESET === "1";

  console.log(`→ Conectando a MongoDB… (modo: ${RESET ? "RESET total" : "conservar progreso"})`);
  await mongoose.connect(MONGODB_URI);

  // 1) Docente admin (upsert por email)
  let admin = await User.findOne({ email: ADMIN.email });
  if (!admin) {
    admin = await User.create({
      name: ADMIN.name,
      email: ADMIN.email,
      passwordHash: await bcrypt.hash(ADMIN.password, 10),
      role: "docente",
      avatarColor: "#2563EB",
      approved: true,
      superAdmin: true,
    });
    console.log(`✓ Superadmin creado: ${ADMIN.email} / ${ADMIN.password}`);
  } else {
    admin.name = ADMIN.name;
    admin.passwordHash = await bcrypt.hash(ADMIN.password, 10);
    admin.role = "docente";
    admin.approved = true;
    admin.superAdmin = true;
    await admin.save();
    console.log(`• Superadmin actualizado: ${ADMIN.email} / ${ADMIN.password}`);
  }

  // 1.5) En RESET eliminamos también los estudiantes de ejemplo (@revuelta.edu)
  // de corridas viejas. En modo conservar NO tocamos cuentas de estudiantes.
  if (RESET) {
    const delStudents = await User.deleteMany({
      role: "estudiante",
      email: { $regex: /@revuelta\.edu$/ },
    });
    if (delStudents.deletedCount) {
      console.log(`• ${delStudents.deletedCount} estudiantes de ejemplo eliminados`);
    }
  }

  // 2) Proyecto de ejemplo (upsert por slug; en RESET se borra y recrea).
  const projectFields = {
    name: "ReVuelta",
    slug: "revuelta",
    description:
      "Plataforma full-stack para rotar, vender e intercambiar ropa de segunda. React + Spring Boot + BD relacional.",
    objectives: [
      "Cada estudiante construye su tabla de punta a punta (front, back y BD).",
      "Integrar 5 módulos sobre un módulo común de Autenticación (JWT).",
      "Respetar el mismo contrato de API REST entre equipos.",
      "Trabajar con GitFlow: una rama por historia de usuario.",
    ],
    color: "#1D4ED8",
    owner: admin._id,
    archived: false,
  };
  let project = await Project.findOne({ slug: "revuelta" });
  if (project && RESET) {
    await Promise.all([
      Story.deleteMany({ project: project._id }),
      Team.deleteMany({ project: project._id }),
      Membership.deleteMany({ project: project._id }),
    ]);
    await Project.deleteOne({ _id: project._id });
    project = null;
    console.log("• Proyecto de ejemplo anterior eliminado (RESET)");
  }
  if (!project) {
    project = await Project.create(projectFields);
    console.log("✓ Proyecto 'ReVuelta' creado");
  } else {
    await Project.updateOne({ _id: project._id }, { $set: projectFields });
    console.log("• Proyecto 'ReVuelta' actualizado (se conserva el progreso)");
  }

  // Upsert de equipo por (proyecto, nombre): mantiene su _id estable para que
  // membresías e historias no pierdan su referencia entre corridas.
  async function upsertTeam(name, fields) {
    const existing = await Team.findOne({ project: project._id, name });
    if (existing) {
      await Team.updateOne({ _id: existing._id }, { $set: fields });
      return existing;
    }
    return Team.create({ project: project._id, name, ...fields });
  }

  // Equipo común de Autenticación: aquí vive la entidad Usuario (ejemplo del docente).
  const authTeam = await upsertTeam("Común · Autenticación", {
    moduleName: "Autenticación y Usuarios (módulo común)",
    color: "#0891B2",
    description:
      "Módulo transversal: la entidad Usuario y la seguridad con JWT. Ejemplo guiado por el docente.",
  });

  // Membresía del docente en el módulo común (upsert, sin duplicar).
  const adminMem = await Membership.findOne({ project: project._id, user: admin._id });
  if (!adminMem) {
    await Membership.create({ project: project._id, user: admin._id, team: authTeam._id, scrumMaster: true });
  } else {
    await Membership.updateOne({ _id: adminMem._id }, { $set: { team: authTeam._id, scrumMaster: true } });
  }
  console.log("✓ Proyecto y equipo común listos");

  // 3) Equipos de estudiantes (upsert por nombre) + lista de tablas.
  let storyCount = 0;
  const roster = []; // { teamDef, team, student(table), si }
  for (const teamDef of TEAMS) {
    const team = await upsertTeam(teamDef.name, {
      moduleName: teamDef.moduleName,
      color: teamDef.color,
    });
    for (let si = 0; si < teamDef.students.length; si++) {
      roster.push({ teamDef, team, student: teamDef.students[si], si });
    }
    console.log(`✓ ${teamDef.name}: ${teamDef.students.length} tablas`);
  }

  // Convierte las relaciones "id_x → tabla" en {fk, target, Entity}.
  const relListOf = (st) =>
    (st.relations || []).map((rel) => {
      const [fk, target] = rel.split("→").map((s) => s.trim());
      return { fk, target, Entity: pascal(target) };
    });

  // ── Definición de TODAS las HUs, en orden de visualización ───────────────
  // Cada entrada: { code, team, defaultAssignee, def }. El `def` es solo la
  // DEFINICIÓN (título, descripción, criterios, tipo, prioridad, puntos); el
  // progreso (responsable, estado, orden, fechas) lo decide el upsert.
  const storyDefs = [];

  // Bloque 1: MODELOS (Usuario primero, luego las 18 tablas).
  storyDefs.push({ code: "USR-01", team: authTeam._id, defaultAssignee: admin._id, def: usuarioModeloDef() });
  for (const r of roster) {
    const Entity = pascal(r.student.table);
    storyDefs.push({
      code: `${r.teamDef.prefix}-${String(r.si + 1).padStart(2, "0")}`,
      team: r.team._id,
      defaultAssignee: null,
      def: buildModeloDef({ st: r.student, relList: relListOf(r.student), Entity }),
    });
  }

  // Bloque 2: REPOSITORIOS JPA (Usuario primero, luego las 18 tablas).
  storyDefs.push({ code: "USR-R01", team: authTeam._id, defaultAssignee: admin._id, def: usuarioRepoDef() });
  for (const r of roster) {
    const Entity = pascal(r.student.table);
    storyDefs.push({
      code: `${r.teamDef.prefix}-R${String(r.si + 1).padStart(2, "0")}`,
      team: r.team._id,
      defaultAssignee: null,
      def: buildRepoDef({ st: r.student, relList: relListOf(r.student), Entity }),
    });
  }

  // ── UPSERT por código: conserva el progreso de las HUs que ya existen ─────
  const prev = await Story.find({ project: project._id });
  const prevByCode = new Map(prev.map((s) => [s.code, s]));
  let nextOrder = prev.reduce((m, s) => Math.max(m, s.order ?? 0), -1) + 1;
  let created = 0;
  let updated = 0;
  for (const sd of storyDefs) {
    const existing = prevByCode.get(sd.code);
    if (existing) {
      // Solo actualizamos la DEFINICIÓN; conservamos responsable, estado, orden,
      // bloqueo y fechas tal como los dejó el equipo.
      await Story.updateOne({ _id: existing._id }, { $set: { team: sd.team, ...sd.def } });
      updated++;
    } else {
      // HU nueva: entra "Por hacer", al final del orden actual.
      await Story.create({
        project: project._id,
        team: sd.team,
        assignee: sd.defaultAssignee || null,
        code: sd.code,
        ...sd.def,
        status: "todo",
        order: nextOrder++,
        blockedReason: "",
        dueDate: null,
        completedAt: null,
      });
      created++;
    }
    storyCount++;
  }

  console.log(`✓ ${storyCount} HUs procesadas — ${created} nuevas, ${updated} actualizadas.`);
  if (!RESET) {
    console.log("• Se conservaron responsable, estado y avance de las HUs existentes.");
  }
  console.log("• La entidad Usuario (modelo + repositorio) queda asignada al docente como ejemplo.");
  console.log("\n✅ Semilla completada.");
  console.log(`   Entra como superadmin: ${ADMIN.email} / ${ADMIN.password}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("✖ Error en la semilla:", err);
  process.exit(1);
});
