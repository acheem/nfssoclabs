import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LABS } from "@/lib/labs";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const LABS_REPO = process.env.LABS_REPO ?? "acheem/nfcsoc-labs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/labs?error=github_cancelled", req.url));
  }

  // Decode state
  let userId: string;
  let slug: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
    slug = decoded.slug;
  } catch {
    return NextResponse.redirect(new URL("/labs?error=invalid_state", req.url));
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
  });
  const tokenData = await tokenRes.json();
  const githubToken = tokenData.access_token;

  if (!githubToken) {
    return NextResponse.redirect(new URL(`/labs/${slug}?error=github_auth_failed`, req.url));
  }

  // Store token on user
  await db.user.update({ where: { id: userId }, data: { githubToken } });

  // Find lab launcher config
  const lab = LABS.find((l) => l.slug === slug);
  if (!lab?.launcher) {
    return NextResponse.redirect(new URL(`/labs/${slug}?error=no_launcher`, req.url));
  }

  // Delete any existing codespace for this lab
  const existing = await db.codespace.findFirst({ where: { userId, labSlug: slug } });
  if (existing) {
    await fetch(`https://api.github.com/user/codespaces/${existing.name}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${githubToken}`, "X-GitHub-Api-Version": "2022-11-28" },
    });
    await db.codespace.delete({ where: { id: existing.id } });
  }

  // Create Codespace in user's account
  const [repoOwner, repoName] = LABS_REPO.split("/");
  const csRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/codespaces`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: "main",
      devcontainer_path: lab.launcher.devcontainerPath,
      machine: "basicLinux32gb",
    }),
  });

  if (!csRes.ok) {
    const err = await csRes.text();
    console.error("Codespace creation failed:", err);
    return NextResponse.redirect(new URL(`/labs/${slug}?error=codespace_failed`, req.url));
  }

  const cs = await csRes.json();
  const csName: string = cs.name;
  const csUrl: string = cs.web_url ?? `https://github.com/codespaces/${csName}`;

  // Store codespace record
  await db.codespace.create({
    data: { userId, labSlug: slug, name: csName, url: csUrl },
  });

  return NextResponse.redirect(new URL(`/labs/${slug}?lab_ready=1`, req.url));
}
