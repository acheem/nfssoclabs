# ImmersiveLabs Exam Prep — Claude Collaboration Guide

## Project Goal
Build thorough documentation, SPL queries, and hands-on practice for 6 ImmersiveLabs cybersecurity exam labs before attempting the actual exam. Confidence through research, not guessing.

## Labs in Scope

| # | Lab Title | Category | Tools |
|---|-----------|----------|-------|
| 1 | Incident Response: Clipboard Data Theft | IR / DFIR | Windows artifacts, memory |
| 2 | Splunk: Malicious Account Creation | SIEM | Splunk SPL |
| 3 | FIN7 Threat Hunting with Splunk | Threat Hunting | Splunk SPL, MITRE ATT&CK |
| 4 | Packet Analysis: Demonstrate Your Skills | Network Forensics | Wireshark, tshark |
| 5 | Malicious OneNote Analysis | Malware Analysis | OneNote artifacts |
| 6 | Incident Response: Suspicious Email – Evidence of Compromise | IR / Phishing | Email headers, IOCs |

---

## Working Approach

### For Each Lab
1. **Research** — understand the attack technique, MITRE ATT&CK mapping, common artifacts
2. **Document** — write `notes.md` covering: what to look for, key artifacts, attacker TTPs
3. **Queries/Commands** — write `queries.md` with ready-to-run SPL, Wireshark filters, CLI commands
4. **Practice** — run against Splunk Docker environment (labs 2 & 3) or sample files
5. **Exam** — attempt only after confidence is high

### Output Per Lab
- `notes.md` — theory, TTPs, artifacts, what examiners typically ask
- `queries.md` — copy-paste ready queries and commands

---

## Project Structure

```
immersivelaps-exam/
├── CLAUDE.md                       # This file
├── docker/
│   ├── Dockerfile                  # Splunk + sample data
│   ├── docker-compose.yml
│   └── sample-data/                # Synthetic log files for practice
└── labs/
    ├── 01-clipboard-theft/
    │   ├── notes.md
    │   └── queries.md
    ├── 02-splunk-account-creation/
    │   ├── notes.md
    │   └── queries.md
    ├── 03-fin7-threat-hunting/
    │   ├── notes.md
    │   └── queries.md
    ├── 04-packet-analysis/
    │   ├── notes.md
    │   └── queries.md
    ├── 05-onenote-analysis/
    │   ├── notes.md
    │   └── queries.md
    └── 06-suspicious-email/
        ├── notes.md
        └── queries.md
```

---

## Splunk Docker Environment

- **Purpose:** Run labs 2 (Malicious Account Creation) and 3 (FIN7 Hunting) locally
- **Stack:** Splunk Enterprise Developer (free license), pre-loaded with synthetic logs
- **Access:** Web UI `http://localhost:8000`, REST API `localhost:8089`
- **Credentials:** admin / AABVINLABS1!
- **Sample data:** Windows Security event logs, Sysmon logs, network logs

---

## Key References

- MITRE ATT&CK: https://attack.mitre.org
- Splunk SPL Docs: https://docs.splunk.com/Documentation/Splunk/latest/SearchReference
- Wireshark Display Filters: https://wiki.wireshark.org/DisplayFilters
- Windows Event IDs Cheatsheet (critical ones):
  - 4624 — Logon success
  - 4625 — Logon failure
  - 4720 — User account created
  - 4726 — User account deleted
  - 4732 — Member added to security-enabled local group
  - 4648 — Logon with explicit credentials
  - 4688 — Process creation
  - 1102 — Audit log cleared

---

## Collaboration Rules (for Claude)

- Provide **documentation-quality** answers — thorough enough to use as exam reference
- Always include **ready-to-run** SPL queries, Wireshark filters, or CLI commands
- Map techniques to **MITRE ATT&CK** where applicable
- Do not create files that aren't needed — prefer editing existing ones
- Keep responses concise but technically complete
- When building Docker/sample data, generate **realistic synthetic logs** (not real threat actor data)
