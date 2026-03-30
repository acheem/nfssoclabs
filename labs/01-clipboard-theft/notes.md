# Lab 01 — Incident Response: Clipboard Data Theft

## Attack Overview

Clipboard data theft (T1115) involves an attacker monitoring or harvesting data stored in the Windows clipboard. Commonly used by:
- Banking trojans (Dridex, Emotet, TrickBot) to steal copied credentials/crypto addresses
- RATs with built-in clipboard monitoring
- PowerShell/VBScript one-liners for quick exfil

**MITRE ATT&CK:** T1115 — Clipboard Data

---

## How Clipboard Theft Works

### Method 1: WinAPI Polling
Malware calls `OpenClipboard()` + `GetClipboardData()` in a loop to read clipboard contents at intervals.

### Method 2: Clipboard Format Listener
Uses `AddClipboardFormatListener()` — registers a window to receive `WM_CLIPBOARDUPDATE` messages. More stealthy than polling.

### Method 3: PowerShell
```powershell
# Read clipboard
[System.Windows.Forms.Clipboard]::GetText()

# Set-Clipboard (PowerShell 5+)
Get-Clipboard

# .NET approach
Add-Type -AssemblyName PresentationCore
[System.Windows.Clipboard]::GetText()
```

### Method 4: Scripting (VBScript/WScript)
```vbscript
Set obj = CreateObject("htmlfile")
data = obj.ParentWindow.ClipboardData.GetData("text")
```

---

## Key Artifacts to Investigate

### Process Artifacts
- Unexpected process calling clipboard WinAPI
- Process with no visible window (hidden/background)
- Processes in `%TEMP%`, `%APPDATA%` accessing clipboard
- Child processes of Office apps reading clipboard

### Memory Artifacts
- Clipboard data stored in `win32k.sys` kernel space
- Clipboard handle in process memory
- Strings matching clipboard content in process dumps

### File System Artifacts
- Clipboard contents written to temp files before exfil
- Log files with base64-encoded clipboard data
- `%TEMP%\*.tmp` files with exfiltrated data

### Network Artifacts
- Small periodic HTTP POST requests (clipboard data sent to C2)
- Data encoded in URL parameters or POST body
- Outbound connections shortly after clipboard change events

### Registry Artifacts
- Persistence keys launching clipboard monitor at startup
- `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`

---

## Windows Event IDs Relevant to Clipboard Theft

| Event ID | Source | Relevance |
|----------|--------|-----------|
| 4688 | Security | Process creation — look for scripts/tools accessing clipboard |
| 4663 | Security | Object access — file write of captured data |
| 1 | Sysmon | Process create with clipboard-related command line |
| 3 | Sysmon | Network connection post-clipboard-capture |
| 11 | Sysmon | File created — clipboard dump written to disk |
| 10 | Sysmon | ProcessAccess — injecting into another process to read clipboard |

---

## Common Malware Using Clipboard Theft

| Malware | Technique |
|---------|-----------|
| Dridex | Polls clipboard for banking credentials |
| TrickBot | pwgrab module — clipboard + browser creds |
| Emotet | Clipboard monitoring for credentials |
| Azorult | Steals clipboard + browser creds |
| Raccoon Stealer | Clipboard + crypto wallet theft |
| Clipbanker | Replaces crypto wallet addresses in clipboard |

---

## Clipbanker / Cryptocurrency Address Swapping

A specific subtype — malware monitors clipboard for crypto wallet patterns and **replaces** them:
```
Bitcoin:   1[a-km-zA-HJ-NP-Z1-9]{25,34}
Ethereum:  0x[a-fA-F0-9]{40}
Monero:    4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}
```

**Detection:** Registry modifications + clipboard API hooks + process injected into explorer.

---

## IR Investigation Steps

1. **Identify the suspicious process** — what's reading the clipboard?
2. **Check process parent** — how was it launched?
3. **Review command line** — any encoded PowerShell or script paths?
4. **Check persistence** — is it in Run keys / scheduled tasks?
5. **Network connections** — where is it sending data?
6. **Timeline** — when did it start, what user was affected?
7. **Scope** — is it on multiple hosts?

---

## Common Exam Questions

- "What process was responsible for accessing clipboard data?"
- "What technique (MITRE ID) does this represent?"
- "What registry key was used for persistence?"
- "What data was exfiltrated and to where?"
- "What was the parent process of the malicious executable?"
- "What PowerShell command was used to read clipboard data?"
