# NFCSOC Labs

A hands-on cybersecurity training platform for SOC analysts. Users complete real-world labs and CTF challenges covering incident response, threat hunting, SIEM, network forensics, malware analysis, and web application security.

**Live site:** https://nfssoclabs.vercel.app

---

## How it works for users

1. Sign up at `/register` with email and password
2. Browse labs at `/labs` — 9 labs across 6 disciplines
3. Click a lab to read the overview, artifacts, and queries
4. For Docker labs (Windows SOC, Linux Forensics, Kali AppSec):
   - Click **Start Lab** — the lab runs in their browser, no downloads needed
   - They need a free GitHub account — the platform creates the lab environment in their account automatically
   - The environment is automatically deleted when they submit the correct flag
5. Submit flags at `/ctf` to earn points
6. Track progress on `/dashboard/learner`

---

## Labs

| # | Lab | Category | Type |
|---|-----|----------|------|
| 01 | Incident Response: Clipboard Data Theft | IR / DFIR | Splunk |
| 02 | Splunk: Malicious Account Creation | SIEM | Splunk |
| 03 | FIN7 Threat Hunting with Splunk | Threat Hunting | Splunk |
| 04 | Packet Analysis: Demonstrate Your Skills | Network Forensics | Wireshark |
| 05 | Malicious OneNote Analysis | Malware Analysis | Static analysis |
| 06 | Incident Response: Suspicious Email | IR / Phishing | Email forensics |
| 07 | Windows SOC: Clipboard Banker Forensics | Digital Forensics | Docker / PowerShell |
| 08 | Linux Server Forensics: SSH Compromise | Digital Forensics | Docker / Bash |
| 09 | Kali AppSec: Web Vulnerability Assessment | AppSec / Pentesting | Docker / Kali |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 15 (App Router) |
| Auth | NextAuth v5 (credentials) |
| Database | PostgreSQL on Neon |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Email | Resend |
| Hosting | Vercel |
| Lab environments | GitHub Codespaces (user's own account) |
| Docker labs | Docker Compose |

---

## Environment variables

Set these in Vercel → Project Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL pooler connection string |
| `AUTH_SECRET` | Random 32-byte secret (`openssl rand -base64 32`) |
| `AUTH_URL` | Production URL e.g. `https://nfssoclabs.vercel.app` |
| `RESEND_API_KEY` | Resend API key for password reset emails |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `LABS_REPO` | Public labs repo e.g. `acheem/nfcsoc-labs` |

---

## GitHub OAuth setup (for Start Lab feature)

1. Go to github.com/settings/developers → OAuth Apps → New OAuth App
2. Homepage URL: `https://nfssoclabs.vercel.app`
3. Callback URL: `https://nfssoclabs.vercel.app/api/labs/github/callback`
4. Copy Client ID and Client Secret → add to Vercel env vars

---

## Public labs repo setup

The Docker labs run from a **separate public repo** so any GitHub user can launch them.

1. Create a new public repo: `github.com/new` → name: `nfcsoc-labs`
2. Copy the `docker/` directory into it
3. Set `LABS_REPO=acheem/nfcsoc-labs` in Vercel env vars

---

## Local development

```bash
# 1. Install dependencies
cd website && npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Run database migrations
npx prisma migrate dev

# 4. Start dev server
npm run dev
# http://localhost:3000
```

### Run a Docker lab locally

```bash
# Windows SOC lab
cd docker/windows-soc
docker-compose up -d
docker exec -it windows-soc-lab pwsh

# Linux Forensics lab
cd docker/linux-forensics
docker-compose up -d
docker exec -it linux-forensics-lab bash

# Kali AppSec lab
cd docker/kali-appsec
docker-compose up -d
docker exec -it kali-appsec-lab bash
# Target app: http://localhost:5000

# Stop and delete when done
docker-compose down -v
```

---

## Project structure

```
├── website/                  Next.js app
│   ├── src/app/              Pages and API routes
│   ├── src/components/       Reusable components
│   ├── src/lib/              Auth, DB, lab data
│   └── prisma/               Schema and migrations
├── docker/
│   ├── windows-soc/          PowerShell forensics lab
│   ├── linux-forensics/      Ubuntu server forensics lab
│   ├── kali-appsec/          Kali web AppSec lab
│   └── sample-data/          Splunk synthetic logs
└── labs/                     Study notes and SPL queries
```
