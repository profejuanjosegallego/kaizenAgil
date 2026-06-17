import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login", "/reset"];

async function isValidToken(token) {
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await isValidToken(token);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Usuario sin sesion intentando entrar a una pagina protegida.
  if (!valid && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Usuario con sesion en /login: lo mandamos al panel (no en /reset).
  if (valid && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/proyectos";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protege todo menos assets, api y archivos estaticos. Las APIs validan aparte.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
