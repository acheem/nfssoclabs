import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const state = Buffer.from(JSON.stringify({ userId: session.user.id, slug })).toString("base64url");

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: "codespace user:email",
    state,
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
}
