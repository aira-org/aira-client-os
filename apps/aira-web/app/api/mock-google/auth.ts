import { NextResponse } from "next/server";

export async function GET() {
  // Fake token
  const token = "mock-access-token-123";

  const response = NextResponse.redirect(
    "http://localhost:3000"
  );

  // Set cookie like backend would
  response.cookies.set("access-token", token, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
