# Lab 05 — Malicious OneNote Analysis

## Attack Overview

Attackers embed malicious files (scripts, executables, HTA files) inside `.one` (OneNote) files. When the victim clicks the embedded content, the payload executes. This technique surged in 2023 as a phishing attachment alternative to macro-enabled Office files (after Microsoft disabled macros by default).

**MITRE ATT&CK:**
- T1566.001 — Phishing: Spearphishing Attachment
- T1204.002 — User Execution: Malicious File
- T1059.001 — PowerShell (common payload)
- T1059.005 — VBScript (common payload)
- T1218.005 — MSHTA (common payload)

---

## How Malicious OneNote Works

### Structure
A `.one` file is a binary format (CFBF - Compound File Binary Format) containing:
- Note sections and pages
- **Embedded attachment objects** (OLE objects)
- Images (often used to overlay "Click here" decoy)

### Attack Flow
```
Phishing email → .one attachment → Victim opens →
Clicks embedded button/image → Warning prompt →
Victim clicks "OK" → Embedded script/exe executes →
Malware downloads/runs
```

### Common Embedded Payloads
| File Type | Extension | What It Does |
|-----------|-----------|--------------|
| HTA file | `.hta` | Executes HTML Application via mshta.exe |
| VBScript | `.vbs` | Script execution via wscript/cscript |
| Batch file | `.bat` / `.cmd` | Command execution |
| PowerShell | `.ps1` | PowerShell execution |
| JavaScript | `.js` | JScript execution via wscript |
| Executable | `.exe` | Direct binary execution |
| LNK file | `.lnk` | Shortcut executing hidden command |
| DLL | `.dll` | rundll32.exe execution |

---

## Analysis Approach

### Static Analysis (No Execution)

#### 1. File Identification
```bash
file suspicious.one
xxd suspicious.one | head -4     # Check magic bytes: D0 CF 11 E0 (CFBF)
```

#### 2. Extract with OneNoteAnalyzer / onenote-extractor
```bash
# Using Python olentools
pip install olentools
olevba suspicious.one            # Extract VBA/scripts
oleid suspicious.one             # Identify OLE objects
oleobj suspicious.one            # Extract embedded objects
```

#### 3. Strings Analysis
```bash
strings suspicious.one | grep -E "(http|ftp|cmd|powershell|wscript|mshta)"
strings suspicious.one | grep -E "\.exe|\.dll|\.ps1|\.vbs|\.hta|\.bat"
strings suspicious.one | grep -iE "(download|invoke|base64|encoded)"
```

#### 4. Binary Search for Embedded Files
```bash
# Search for PE header (embedded EXE)
xxd suspicious.one | grep "4d 5a"   # MZ header

# Search for HTA patterns
strings suspicious.one | grep -i "<script"
strings suspicious.one | grep -i "mshta"
```

### Dynamic Analysis (Sandbox)
- Upload to Any.run, Hybrid Analysis, or VirusTotal
- Monitor: process creation, network connections, file drops, registry changes
- Key: what child process does OneNote (ONENOTE.EXE) spawn?

---

## Key Artifacts

### File System
- Extracted embedded files dropped to `%TEMP%` on execution
- OneNote cache: `%LOCALAPPDATA%\Microsoft\OneNote\`
- Attachment temp path: `%TEMP%\OneNote\` or `%APPDATA%\Local\Temp\`

### Process Chain (ONENOTE.EXE children)
```
ONENOTE.EXE
  └─ mshta.exe        (HTA payload)
  └─ wscript.exe      (VBS/JS payload)
  └─ powershell.exe   (PS1 payload)
  └─ cmd.exe          (BAT/CMD payload)
  └─ [malware].exe    (Direct EXE drop)
```

### Registry
- OneNote recent files: `HKCU\Software\Microsoft\Office\XX.0\OneNote\Options`
- Malware persistence added post-execution

### Network
- Malware typically downloads second-stage from C2 immediately after execution
- Common: PowerShell `DownloadString` or `DownloadFile` to attacker domain

---

## Common Obfuscation Techniques in OneNote Malware

### Visual Decoy
- Blurred/fake document image overlaid on the page
- "Double-click to view document" or "Click here to unlock"
- Embedded content hidden behind image layer

### Payload Obfuscation
```powershell
# Base64 encoded command in embedded script
powershell -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdA...

# String concatenation to avoid detection
$c = "In" + "voke" + "-Exp" + "ression"

# Char code obfuscation
[char]73+[char]69+[char]88  # = IEX

# Compressed + base64
$data = "H4sI..." | ConvertFrom-Base64 | Expand-ZipArchive
```

---

## Tools for OneNote Analysis

| Tool | Purpose | Usage |
|------|---------|-------|
| olentools/oleobj | Extract OLE embedded objects | `oleobj suspicious.one` |
| olevba | Extract VBA macros | `olevba suspicious.one` |
| OneNoteAnalyzer | Dedicated .one parser | GUI / CLI |
| strings | Find readable strings | `strings suspicious.one` |
| xxd / hexdump | Hex analysis | `xxd suspicious.one \| head` |
| VirusTotal | AV + sandbox | Upload file |
| Any.run | Interactive sandbox | Upload + click |
| CyberChef | Decode payloads | Paste encoded strings |

---

## Common Exam Questions

- "What type of file was embedded in the OneNote document?"
- "What process does OneNote spawn when the payload is triggered?"
- "What URL does the payload download from?"
- "What obfuscation technique was used?"
- "What is the decoded payload?"
- "What MITRE ATT&CK technique does this represent?"
- "What file was dropped to disk?"
- "What persistence mechanism was established?"
