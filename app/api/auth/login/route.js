import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { authService } from "@/lib/services/authService";
import { validateLogin } from "@/lib/validators/schemas";
import { buildAuthCookie } from "@/lib/auth/cookie";

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const data = validateLogin(body);
  const { token, user } = await authService.login(data);

  const response = NextResponse.json({ user });
  response.cookies.set(buildAuthCookie(token));
  return response;
});
