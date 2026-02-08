import { NextResponse } from "next/server";

export async function GET() {
  const token = "mock-access-token";

  const res = NextResponse.redirect(
    "http://localhost:3000" // change if needed
  );

  res.cookies.set("access-token", token, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
