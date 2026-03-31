import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { labSlug } = await req.json();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { codespaces: { where: { labSlug } } },
  });

  if (!user?.githubToken || !user.codespaces.length) {
    return NextResponse.json({ success: true }); // nothing to clean up
  }

  const codespace = user.codespaces[0];

  await fetch(`https://api.github.com/user/codespaces/${codespace.name}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${user.githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  await db.codespace.delete({ where: { id: codespace.id } });

  return NextResponse.json({ success: true });
}
