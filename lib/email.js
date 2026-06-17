import nodemailer from "nodemailer";

/**
 * Envío de correo con Nodemailer (open source).
 * - Si defines SMTP_HOST + SMTP_USER + SMTP_PASS en .env.local, usa ese SMTP
 *   real (ej. Gmail con "contraseña de aplicación").
 * - Si no, crea una cuenta de prueba Ethereal automáticamente y registra en
 *   consola un enlace para VER el correo (ideal para desarrollo).
 */
let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const port = Number(SMTP_PORT) || 587;
      return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    }
    // Fallback de desarrollo: cuenta de prueba.
    const test = await nodemailer.createTestAccount();
    console.log("[email] SMTP no configurado: usando cuenta de prueba Ethereal");
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: test.user, pass: test.pass },
    });
  })();
  return transporterPromise;
}

export async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = await getTransporter();
    const from = process.env.SMTP_FROM || "Kaizen <no-reply@kaizen.local>";
    const info = await transporter.sendMail({ from, to, subject, html, text });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`[email] enviado a ${to} · ver: ${preview}`);
    return { ok: true, preview };
  } catch (err) {
    // El correo es "best-effort": nunca debe tumbar la operación principal.
    console.error("[email] error al enviar:", err.message);
    return { ok: false, error: err.message };
  }
}

const baseStyle =
  "font-family:Arial,Helvetica,sans-serif;color:#0F1B2E;max-width:520px;margin:0 auto";

export function welcomeEmail({ name, email, password, role }) {
  const rol = role === "docente" ? "docente" : "estudiante";
  const nota =
    role === "docente"
      ? "<p>Tu cuenta de <b>docente</b> quedó <b>pendiente de autorización</b>. Te avisaremos cuando el administrador la apruebe.</p>"
      : "<p>Ya puedes iniciar sesión y empezar a trabajar en tu tablero.</p>";
  return {
    subject: "Bienvenido a Kaizen · tus credenciales",
    html: `<div style="${baseStyle}">
      <h2 style="color:#1D4ED8">Kaizen</h2>
      <p>Hola <b>${name}</b>, tu cuenta de ${rol} fue creada.</p>
      <table style="border-collapse:collapse;margin:14px 0">
        <tr><td style="padding:6px 12px;background:#F1F5F9;border:1px solid #CBD5E1"><b>Usuario</b></td>
            <td style="padding:6px 12px;border:1px solid #CBD5E1">${email}</td></tr>
        <tr><td style="padding:6px 12px;background:#F1F5F9;border:1px solid #CBD5E1"><b>Contraseña</b></td>
            <td style="padding:6px 12px;border:1px solid #CBD5E1">${password}</td></tr>
      </table>
      ${nota}
      <p style="color:#64748B;font-size:12px">Por seguridad, cambia tu contraseña después de ingresar.</p>
    </div>`,
    text: `Hola ${name}, tu cuenta de ${rol} fue creada.\nUsuario: ${email}\nContraseña: ${password}`,
  };
}

export function resetEmail({ name, link }) {
  return {
    subject: "Restablece tu contraseña · Kaizen",
    html: `<div style="${baseStyle}">
      <h2 style="color:#1D4ED8">Kaizen</h2>
      <p>Hola <b>${name}</b>, recibimos una solicitud para restablecer tu contraseña.</p>
      <p style="margin:18px 0">
        <a href="${link}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Crear nueva contraseña</a>
      </p>
      <p style="color:#64748B;font-size:12px">El enlace vence en 1 hora. Si no fuiste tú, ignora este correo; tu contraseña no cambiará.</p>
      <p style="color:#64748B;font-size:12px">Si el botón no funciona, copia este enlace:<br>${link}</p>
    </div>`,
    text: `Hola ${name}, restablece tu contraseña aquí (vence en 1 hora): ${link}`,
  };
}

export function approvedEmail({ name }) {
  return {
    subject: "Tu cuenta de docente fue autorizada",
    html: `<div style="${baseStyle}">
      <h2 style="color:#1D4ED8">Kaizen</h2>
      <p>Hola <b>${name}</b>, tu cuenta de docente ya fue <b>autorizada</b>.</p>
      <p>Ya puedes iniciar sesión y crear tus proyectos.</p>
    </div>`,
    text: `Hola ${name}, tu cuenta de docente fue autorizada. Ya puedes iniciar sesión.`,
  };
}
