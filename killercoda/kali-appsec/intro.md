## NFCSOC Labs — Kali AppSec: Web Vulnerability Assessment

**Pentest Scope — NFC Internal Employee Portal**

You have been tasked with a full web application security assessment of the NFC Internal Portal.

**Three challenges, three flags:**
- Challenge 1 — SQL Injection on `/login` (bypass auth, read admin notes)
- Challenge 2 — Path Traversal on `/files` (read files outside the web root)
- Challenge 3 — Command Injection on `/ping` (execute OS commands)

Use `show_objectives` to see the full challenge list.
Use `show_hints <vuln> <1-3>` for hints (e.g. `show_hints sqli 1`).
