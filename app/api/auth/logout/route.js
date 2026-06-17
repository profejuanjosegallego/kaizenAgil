import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { buildClearCookie } from "@/lib/auth/cookie";

export const POST = apiHandler(async () => {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(buildClearCookie());
  return response;
});
