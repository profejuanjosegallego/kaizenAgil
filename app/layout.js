import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DESCRIPTION =
  "Kaizen: gestiona tus proyectos con metodología ágil. Objetivos, equipos, historias de usuario, tablero Kanban con drag & drop y métricas en vivo. Mejora continua, un sprint a la vez.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kaizen · Gestión ágil de proyectos",
    template: "%s · Kaizen",
  },
  description: DESCRIPTION,
  applicationName: "Kaizen",
  authors: [{ name: "Juan José Gallego Mesa" }],
  creator: "Juan José Gallego Mesa, M.Sc.",
  keywords: ["kaizen", "ágil", "kanban", "scrum", "historias de usuario", "proyectos", "educación"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Kaizen",
    title: "Kaizen · Gestión ágil de proyectos",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "Kaizen · Gestión ágil de proyectos",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
