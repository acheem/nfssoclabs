# Lab 06 — Incident Response: Suspicious Email – Evidence of Compromise

## Attack Overview

Phishing email leads to compromise. IR task: analyze the email artifacts AND post-compromise evidence to determine what happened, how, and what was affected.

**MITRE ATT&CK:**
- T1566.001 — Phishing: Spearphishing Attachment
- T1566.002 — Phishing: Spearphishing Link
- T1204.002 — User Execution: Malicious File
- T1204.001 — User Execution: Malicious Link

---

## Phase 1: Email Analysis

### Email Header Fields to Examine

| Field | What to Check |
|-------|--------------|
| `From` | Display name vs actual sending address mismatch |
| `Reply-To` | Different from From? Red flag |
| `Return-Path` | Should match From domain |
| `Received` | Trace email path — look for unexpected relays |
| `X-Originating-IP` | Actual sending IP |
| `Message-ID` | Domain in Message-ID should match From domain |
| `Authentication-Results` | SPF, DKIM, DMARC pass/fail |
| `X-Mailer` | Unusual mail client (bulk mailer, script) |

### SPF / DKIM / DMARC
```
SPF PASS   = IP authorized to send for domain
SPF FAIL   = IP NOT authorized → likely spoofed
DKIM PASS  = Email content unmodified, signed by domain
DKIM FAIL  = Content modified or not signed by domain
DMARC FAIL = SPF + DKIM both fail → high confidence phishing
```

### Sender Spoofing Patterns
- `From: CEO Name <ceo@evil-domain.com>` — display name spoofing
- `From: ceo@comp4ny.com` — typosquat domain (4 instead of a)
- `From: ceo@company.com.evil.com` — subdomain spoofing
- Unicode lookalike chars in domain (a → а cyrillic)

### Suspicious Email Indicators
- Urgency language ("Immediate action required")
- Unusual sender for the context
- Unexpected attachment (invoice, resume, shipping)
- Link URL doesn't match display text
- Attachment with double extension: `invoice.pdf.exe`
- Password-protected ZIP (evades AV scanning)
- Macro-enabled Office file
- OneNote attachment (.one)

---

## Phase 2: Attachment / Link Analysis

### Attachment Types & Risk
| Extension | Risk | What to Do |
|-----------|------|------------|
| .docm / .xlsm | High | Extract macros with olevba |
| .exe / .dll | Critical | String analysis + sandbox |
| .one | High | oleobj extraction |
| .lnk | High | Read target path |
| .iso / .img | High | Mount and check contents |
| .zip (passworded) | High | Extract, analyze contents |
| .html / .htm | Medium | Phishing page or HTML smuggling |
| .pdf | Medium | Check for embedded JS/links |

### URL Analysis
```bash
# Check URL reputation
curl -s "https://www.virustotal.com/api/v3/urls" -X POST ...

# Extract URLs from email body
grep -oE 'https?://[^ >"]+' email.eml

# Defang URL for safe sharing
# https://evil.com/path → hxxps://evil[.]com/path

# Check domain registration
whois evil-domain.com
```

### HTML Smuggling Detection
- Base64-encoded blob inside HTML file
- JavaScript `atob()` decoding blob on load
- Auto-download triggered by HTML `<a>` with `download` attribute
- `Blob` URL creation in JavaScript

---

## Phase 3: Post-Compromise Evidence

### Host Artifacts to Check

#### Prefetch Files
```
C:\Windows\Prefetch\*.pf
Shows: what executables ran, when, how many times
Key: POWERSHELL.EXE-*.pf, CMD.EXE-*.pf, MSHTA.EXE-*.pf
```

#### Browser Artifacts
```
Downloads folder
Browser history (SQLite DB)
Chrome: %LOCALAPPDATA%\Google\Chrome\User Data\Default\History
Firefox: %APPDATA%\Mozilla\Firefox\Profiles\*.default\places.sqlite
```

#### Email Client Artifacts
```
Outlook PST/OST: %LOCALAPPDATA%\Microsoft\Outlook\
Outlook cache: %LOCALAPPDATA%\Microsoft\Windows\INetCache\Content.Outlook\
Recently opened attachments: %TEMP%\Outlook Temp\
```

#### Recent Files (LNK)
```
%APPDATA%\Microsoft\Windows\Recent\
%APPDATA%\Microsoft\Office\Recent\
ShellBag artifacts in registry
```

#### NTFS $MFT / USN Journal
```
Tracks file creation/modification/deletion
Evidence of dropped malware even if deleted
```

### Windows Event Log Evidence

| Event ID | What It Tells You |
|----------|------------------|
| 4688 | Process created by user post-email |
| 4624 | User logon time (baseline normal activity) |
| 4648 | Credential use with explicit credentials |
| 4720 | Account creation (post-compromise persistence) |
| 4732 | Admin group modification |
| 1 (Sysmon) | Full process create + cmdline |
| 3 (Sysmon) | Network connection from malware |
| 11 (Sysmon) | File drop to disk |
| 13 (Sysmon) | Registry persistence |
| 4104 (PS) | PowerShell script block logging |

### PowerShell Script Block Logging (Event 4104)
Critical for phishing IR — shows decoded PowerShell even if obfuscated:
```
Event Log: Microsoft-Windows-PowerShell/Operational
Event ID:  4104
```

---

## Phase 4: Timeline Reconstruction

### Key Questions
1. **When** did the email arrive? (Email server logs)
2. **When** was the attachment opened? (LNK, prefetch, Office MRU)
3. **What** process was spawned? (4688/Sysmon 1)
4. **What** was downloaded? (Sysmon 3, proxy logs)
5. **What** was dropped to disk? (Sysmon 11)
6. **What** persistence was created? (Sysmon 13, 4698)
7. **Did** lateral movement occur? (4624 type 3/10, 4648)
8. **Was** data exfiltrated? (Sysmon 3, proxy/firewall logs)

### Timeline Template
```
[T+0:00]  Email received — user@company.com from attacker@evil.com
[T+0:15]  User opens attachment (Office/OneNote MRU, LNK file)
[T+0:15]  WINWORD.EXE spawns powershell.exe (Event 4688)
[T+0:16]  PowerShell connects to C2, downloads payload (Sysmon 3)
[T+0:16]  Payload dropped to %TEMP%\update.exe (Sysmon 11)
[T+0:17]  update.exe executes (Event 4688)
[T+0:18]  Registry Run key created for persistence (Sysmon 13)
[T+0:20]  Beaconing begins every 60s to C2 IP (Sysmon 3)
[T+1:30]  Lateral movement via RDP to DC (Event 4624 type 10)
[T+2:00]  New admin account created (Event 4720, 4732)
[T+3:00]  Data staged and exfiltrated (Sysmon 3, large POST)
```

---

## Common Exam Questions

- "What is the sender's email address / IP?"
- "Did SPF/DKIM/DMARC pass or fail?"
- "What was the attachment name / type?"
- "What process was spawned after the email was opened?"
- "What URL did the malware connect to?"
- "What file was dropped to disk?"
- "Was persistence established? Where?"
- "What user account was compromised?"
- "Did lateral movement occur? To which host?"
- "What data was accessed or exfiltrated?"
- "What is the timeline of events?"
