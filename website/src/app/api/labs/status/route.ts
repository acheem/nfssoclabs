import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ url: null });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ url: null });

  const codespace = await db.codespace.findFirst({
    where: { userId: session.user.id, labSlug: slug },
  });

  return NextResponse.json({ url: codespace?.url ?? null });
}
