/* eslint-disable no-console */
/**
 * Semilla de datos. Crea (o recrea) un proyecto de EJEMPLO: "ReVuelta".
 * - 1 docente administrador (de las variables SEED_ADMIN_*)
 * - 5 equipos (cada uno con su color), 18 estudiantes (uno por tabla)
 * - HUs por cada capa del backend + frontend, TODAS en "Por hacer",
 *   con criterios de aceptación y ordenadas por temática (primero BD,
 *   luego modelo, repositorio, etc.). Las HU de BD y modelo usan los
 *   campos y relaciones reales de cada tabla diseñada.
 *
 * Uso:  npm run seed
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
      { name: "Mejía Corrales Andres Felipe", table: "imagenes_prenda", fields: ["id", "url", "es_principal", "orden", "formato", "tamano_kb", "fecha_subida"], relations: ["id_prenda → prendas"] },
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
      { name: "Alzate Grajales Alejandro", table: "campanas", fields: ["id", "nombre", "descripcion", "fecha_inicio", "fecha_fin", "descuento_pct", "activa"], relations: [] },
      { name: "Aristizábal Londoño Alejandro", table: "cupones", fields: ["id", "codigo", "tipo", "valor", "usos_maximos", "usos_actuales", "fecha_expiracion"], relations: ["id_campana → campanas"] },
      { name: "Torres Rodríguez Juan Esteban", table: "recompensas", fields: ["id", "nombre", "puntos_requeridos", "descripcion", "stock", "tipo", "activa"], relations: [] },
    ],
  },
  {
    name: "Equipo 5 · Comunidad",
    moduleName: "Comunidad, Reputación y Valoraciones",
    prefix: "COM",
    color: "#1E3A8A",
    students: [
      { name: "Castaño Ocampo Mauricio", table: "resenas", fields: ["id", "comentario", "titulo", "fecha", "recomendado", "editada", "visible"], relations: ["id_autor → usuarios", "id_usuario_resenado → usuarios"] },
      { name: "Gudelo Niño Diego Alejandro", table: "calificaciones", fields: ["id", "puntaje", "dimension", "comentario_corto", "fecha", "verificada", "peso"], relations: ["id_resena → resenas"] },
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
  if (/^(cantidad|orden|capacidad|usos_maximos|usos_actuales|puntos_requeridos|stock|nivel_desgaste|puntaje|peso|tamano_kb)$/.test(f))
    return "Integer";
  return "String";
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
  console.log("→ Conectando a MongoDB…");
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

  // 1.5) Eliminar estudiantes de ejemplo de corridas anteriores (@revuelta.edu).
  const delStudents = await User.deleteMany({
    role: "estudiante",
    email: { $regex: /@revuelta\.edu$/ },
  });
  if (delStudents.deletedCount) {
    console.log(`• ${delStudents.deletedCount} estudiantes de ejemplo eliminados`);
  }

  // 2) Recrear proyecto de ejemplo (limpio)
  const existing = await Project.findOne({ slug: "revuelta" });
  if (existing) {
    await Promise.all([
      Story.deleteMany({ project: existing._id }),
      Team.deleteMany({ project: existing._id }),
      Membership.deleteMany({ project: existing._id }),
    ]);
    await Project.deleteOne({ _id: existing._id });
    console.log("• Proyecto de ejemplo anterior eliminado");
  }

  const project = await Project.create({
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
  });
  await Membership.create({ project: project._id, user: admin._id, team: null });
  console.log("✓ Proyecto 'ReVuelta' creado");

  // 3) Equipos, estudiantes y HUs (todas en "todo", orden por temática)
  let studentIdx = 0;
  let storyCount = 0;

  // Creamos los equipos y la lista de tablas (SIN estudiantes: ellos se
  // registran solos y el docente los agrega al tablero después).
  const roster = []; // { teamDef, team, student(table), si, studentIdx }
  for (const teamDef of TEAMS) {
    const team = await Team.create({
      project: project._id,
      name: teamDef.name,
      moduleName: teamDef.moduleName,
      color: teamDef.color,
      description: "",
    });

    for (let si = 0; si < teamDef.students.length; si++) {
      roster.push({ teamDef, team, student: teamDef.students[si], si, studentIdx });
      studentIdx++;
    }
    console.log(`✓ ${teamDef.name}: ${teamDef.students.length} tablas`);
  }

  // 18 HUs iniciales: UNA por tabla, enfocada en modelar la entidad en
  // Spring Boot (@Entity, @Table, @Id y relaciones @ManyToOne/@OneToMany).
  for (const r of roster) {
    const st = r.student;
    const Entity = pascal(st.table);
    const fieldsNoId = st.fields.filter((f) => f !== "id");
    const fieldsTyped = fieldsNoId.map((f) => `${f} (${javaType(f)})`).join(", ");

    // Cada relación "id_x → tabla" se modela como @ManyToOne hacia esa entidad.
    const relList = (st.relations || []).map((rel) => {
      const [fk, target] = rel.split("→").map((s) => s.trim());
      return { fk, target, Entity: pascal(target) };
    });
    const relatedNames = relList.map((x) => x.Entity);
    // Para nombrar las entidades sin repetir (ej. trueques se relaciona 2 veces con Prendas).
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

    await Story.create({
      project: project._id,
      team: r.team._id,
      assignee: null, // sin asignar: cada estudiante toma su HU al entrar
      code: `${r.teamDef.prefix}-${String(r.si + 1).padStart(2, "0")}`,
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
      status: "todo",
      priority: "high",
      points: 3,
      order: r.studentIdx,
      blockedReason: "",
      dueDate: null,
      completedAt: null,
    });
    storyCount++;
  }

  console.log(`✓ ${storyCount} historias creadas (todas en "Por hacer", sin asignar)`);
  console.log("• Sin estudiantes: se registran ellos mismos y luego los agregas al tablero.");
  console.log("\n✅ Semilla completada.");
  console.log(`   Entra como superadmin: ${ADMIN.email} / ${ADMIN.password}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("✖ Error en la semilla:", err);
  process.exit(1);
});
