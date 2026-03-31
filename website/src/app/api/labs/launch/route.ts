import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LABS } from "@/lib/labs";

const LABS_REPO = process.env.LABS_REPO ?? "acheem/nfcsoc-labs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { slug } = await req.json();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { codespaces: { where: { labSlug: slug } } },
  });

  if (!user?.githubToken) {
    return NextResponse.json({ needsGitHub: true });
  }

  // Already has a running codespace
  if (user.codespaces.length > 0) {
    return NextResponse.json({ url: user.codespaces[0].url });
  }

  const lab = LABS.find((l) => l.slug === slug);
  if (!lab?.launcher) {
    return NextResponse.json({ error: "No launcher for this lab" }, { status: 400 });
  }

  const [repoOwner, repoName] = LABS_REPO.split("/");
  const csRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/codespaces`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${user.githubToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: "main",
      devcontainer_path: lab.launcher.devcontainerPath,
      machine: "basicLinux32gb",
    }),
  });

  // Token may have expired — re-auth
  if (csRes.status === 401) {
    await db.user.update({ where: { id: user.id }, data: { githubToken: null } });
    return NextResponse.json({ needsGitHub: true });
  }

  if (!csRes.ok) {
    return NextResponse.json({ error: "Failed to start lab. Please try again." }, { status: 500 });
  }

  const cs = await csRes.json();
  const csName: string = cs.name;
  const csUrl: string = cs.web_url ?? `https://github.com/codespaces/${csName}`;

  await db.codespace.create({
    data: { userId: user.id, labSlug: slug, name: csName, url: csUrl },
  });

  return NextResponse.json({ url: csUrl });
}
