# Nexus Financial Corp — SOC CTF Challenge

## Environments

| Lab | Container | Access |
|-----|-----------|--------|
| Splunk SIEM (Scenarios A–F) | `splunk-lab` | `http://localhost:8000` — `admin / AABVINLABS1!` |
| Windows SOC Forensics (Scenario A interactive) | `windows-soc-lab` | `docker attach windows-soc-lab` |
| Linux Deep Forensics (Scenario G) | `linux-forensics-lab` | `docker attach linux-forensics-lab` |
| Kali AppSec (Scenario H) | `kali-appsec-lab` | `docker attach kali-appsec-lab` → `http://localhost:5000` |

**Indexes (Splunk):** `index=windows` | `index=network`
**Date of incident:** 2024-11-19

> You are the SOC analyst on shift. Eight security incidents occurred across Windows, Linux, and web systems.
>
> Flags are in format: `NFCSOC{...}`
> Hints are locked — request them only if stuck.
> To request a hint: open `ctf/hints/` and read the matching file.

---

## Scenario A — Clipboard Data Theft (30 pts)

**Alert triggered:** Unusual outbound connection from Finance workstation during business hours.
**Your starting point:**
```spl
index=windows host=NFC-WS-041 | table TimeCreated, EventCode, EventID, NewProcessName, CommandLine | sort TimeCreated
```

| # | Question | Points |
|---|----------|--------|
| A1 | What is the full path of the malicious executable dropped on NFC-WS-041? | 5 |
| A2 | What external IP address is the malware communicating with? | 5 |
| A3 | What registry key was used for persistence? (full path) | 5 |
| A4 | What PowerShell assembly was loaded to access clipboard data? | 5 |
| A5 | What MITRE ATT&CK technique ID covers clipboard theft? | 5 |
| A6 | What scheduled task name was created for persistence? (full path) | 5 |

**Flag:** `NFCSOC{clip_b4nk3r_exf1l_r0ck3t}`

---

## Scenario B — Malicious Account Creation (25 pts)

**Alert triggered:** New privileged account detected on Domain Controller outside change window.
**Your starting point:**
```spl
index=windows host=NFC-SRV-DC1 | table TimeCreated, EventCode, SubjectUserName, TargetUserName, CommandLine | sort TimeCreated
```

| # | Question | Points |
|---|----------|--------|
| B1 | What is the name of the backdoor account created? | 5 |
| B2 | Which group was the account added to? | 5 |
| B3 | What external IP did the attacker connect from? | 5 |
| B4 | What logon type was used for the attacker's initial access? (number) | 5 |
| B5 | What EventCode indicates the audit log was cleared? | 5 |

**Flag:** `NFCSOC{n3w_4dm1n_backd00r_dc}`

---

## Scenario C — FIN7-Style RAT (30 pts)

**Alert triggered:** WINWORD.EXE spawning cmd.exe on IT workstation.
**Your starting point:**
```spl
index=windows host=NFC-WS-029 | table TimeCreated, EventCode, EventID, Image, CommandLine, ParentImage | sort TimeCreated
```

| # | Question | Points |
|---|----------|--------|
| C1 | What was the filename of the phishing document opened? | 5 |
| C2 | What is the C2 IP address and port used by the RAT? | 5 |
| C3 | What fake system file name was used as the payload? (full path) | 5 |
| C4 | Decode the Base64 PowerShell command — what does it do? | 5 |
| C5 | What account was created on the DC as a persistence mechanism? | 5 |
| C6 | What Sysmon EventID indicates LSASS was accessed? | 5 |

**Flag:** `NFCSOC{f1n7_l4t3r4l_0wned_dc}`

---

## Scenario D — Malicious OneNote (25 pts)

**Alert triggered:** ONENOTE.EXE spawning mshta.exe.
**Your starting point:**
```spl
index=windows host=NFC-WS-058 | table TimeCreated, EventCode, EventID, Image, CommandLine, ParentImage | sort TimeCreated
```

| # | Question | Points |
|---|----------|--------|
| D1 | What was the name of the malicious OneNote file? | 5 |
| D2 | What process did ONENOTE.EXE spawn first? | 5 |
| D3 | What is the full path of the payload dropped to disk? | 5 |
| D4 | What external IP did the payload connect to, and on which port? | 5 |
| D5 | What registry Run key name was used for persistence? | 5 |

**Flag:** `NFCSOC{0n3n0t3_hta_dr0pp3d_m3}`

---

## Scenario E — Suspicious Email / Evidence of Compromise (25 pts)

**Alert triggered:** Chrome opening an HTML file from Outlook temp directory.
**Your starting point:**
```spl
index=windows host=NFC-WS-063 | table TimeCreated, EventCode, EventID, Image, CommandLine, ParentImage, TargetFilename | sort TimeCreated
```

| # | Question | Points |
|---|----------|--------|
| E1 | What was the name of the HTML file opened from Outlook? | 5 |
| E2 | What file was dropped via HTML smuggling? | 5 |
| E3 | What fake application name was used as the malware? | 5 |
| E4 | What external IP received the stolen data? | 5 |
| E5 | What registry key was added for persistence? | 5 |

**Flag:** `NFCSOC{html_smug_cr3d_harv3st}`

---

## Scenario F — Packet Analysis (25 pts)

**Alert triggered:** Network sensor flagged a port scan followed by suspicious FTP and HTTP activity from external IP.
**Your starting point:**
```spl
index=network host=NFC-SENSOR | table TimeCreated, src_ip, dst_ip, dst_port, app, action, bytes_out, bytes_in | sort TimeCreated
```

| # | Question | Points |
|---|----------|--------|
| F1 | What external IP address conducted the port scan? | 5 |
| F2 | Which two TCP ports were found open during the scan? (list both) | 5 |
| F3 | What FTP password was transmitted in cleartext? | 5 |
| F4 | What sensitive file was retrieved via FTP? | 5 |
| F5 | What executable was downloaded over HTTP from the attacker host? | 5 |

**Flag:** `NFCSOC{p4ck3t_4nalys1s_c4ught}`

---

---

## Scenario G — Linux Server Compromise (30 pts)

**Environment:** `docker attach linux-forensics-lab`
**Alert triggered:** Unusual cron activity and outbound connections from production web server NFC-SRV-WEB1.
**Your starting point:**
```bash
grep 'Accepted\|Failed' /var/log/auth.log | tail -20
```

| # | Question | Points |
|---|----------|--------|
| G1 | What external IP address conducted the SSH brute force attack? | 5 |
| G2 | What username was successfully compromised? | 5 |
| G3 | What sudo command did the attacker use to escalate privileges? | 5 |
| G4 | What is the full path of the malware binary dropped on the server? | 5 |
| G5 | What file was exfiltrated and sent to the attacker's server? | 5 |
| G6 | Decode the hidden payload — what is the flag? | 5 |

**Flag:** `NFCSOC{l1nux_srv_c0mpr0m1s3d}`

---

## Scenario H — Web Application Security (30 pts)

**Environment:** `docker attach kali-appsec-lab` → target at `http://localhost:5000`
**Alert triggered:** Anomalous queries and file access patterns detected on NFC Internal Employee Portal.
**Your starting point:**
```bash
curl http://localhost:5000/          # Explore the app
curl http://localhost:5000/api/users # List all users
show_objectives                      # See all 3 challenges
```

| # | Question | Points |
|---|----------|--------|
| H1 | Find and exploit the SQL injection on `/login` — what is the flag in the admin's notes? | 10 |
| H2 | Find and exploit the path traversal on `/files` — read flag2.txt | 10 |
| H3 | Find and exploit the command injection on `/ping` — execute a command to read flag3.txt | 10 |

**Flags:** `NFCSOC{sql_1nj3ct10n_4uth_byp4ss}` | `NFCSOC{p4th_tr4v3rs4l_f1l3_r34d}` | `NFCSOC{c0mm4nd_1nj3ct10n_rc3}`

---

## Scoreboard

| Scenario | Title | Environment | Max Pts | Your Score |
|----------|-------|-------------|---------|------------|
| A | Clipboard Data Theft | Splunk / Windows SOC container | 30 | |
| B | Malicious Account Creation | Splunk | 25 | |
| C | FIN7-Style RAT | Splunk | 30 | |
| D | Malicious OneNote | Splunk | 25 | |
| E | Suspicious Email | Splunk | 25 | |
| F | Packet Analysis | Splunk | 25 | |
| G | Linux Server Compromise | linux-forensics-lab | 30 | |
| H | Web Application Security | kali-appsec-lab | 30 | |
| **Total** | | | **220** | |

---

## Hints

Hints are in `ctf/hints/`. Each file contains progressive hints (vague → specific).
Read only what you need — the challenge is to find it yourself first.

| File | Scenario | Environment |
|------|----------|-------------|
| `hints/scenario_a.md` | Clipboard Theft | Splunk + Windows SOC |
| `hints/scenario_b.md` | Account Creation | Splunk |
| `hints/scenario_c.md` | FIN7 RAT | Splunk |
| `hints/scenario_d.md` | OneNote | Splunk |
| `hints/scenario_e.md` | Suspicious Email | Splunk |
| `hints/scenario_f.md` | Packet Analysis | Splunk |
| `hints/scenario_g.md` | Linux Server Compromise | linux-forensics-lab |
| `hints/scenario_h.md` | Web AppSec | kali-appsec-lab |
