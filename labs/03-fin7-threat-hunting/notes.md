# Lab 03 — FIN7 Threat Hunting with Splunk

## Who is FIN7?

- **AKA:** Carbanak Group, Navigator Group, ITG14
- **Type:** Financially motivated threat actor (eCrime)
- **Active since:** ~2013
- **Targets:** Retail, hospitality, restaurant, financial sectors
- **Known for:** Carbanak malware, BOOSTWRITE, BABYMETAL, DICELOADER
- **MITRE Group ID:** G0046

---

## Malware Families

| Malware | Role | Key Behavior |
|---------|------|--------------|
| Carbanak | Primary RAT | Modular, C2 over HTTP/S, keylogging, screen capture |
| BABYMETAL | Recon tool | Lightweight, precedes Carbanak deployment |
| BOOSTWRITE | Loader/Dropper | DLL hijacking, loads from encrypted blob |
| DICELOADER | Stager | In-memory execution, minimal disk artifacts |
| POWERTRASH | PowerShell loader | Reflective PE injection |
| TIRION | Backdoor | Newer variant, used post-2020 |

---

## MITRE ATT&CK Mapping

### Initial Access
| Technique | ID | Detail |
|-----------|----|--------|
| Spearphishing Attachment | T1566.001 | Macro-enabled Office docs, ZIP with EXE |
| Spearphishing Link | T1566.002 | Links to fake landing pages |
| Supply Chain Compromise | T1195 | Trojanized software installers |

### Execution
| Technique | ID | Detail |
|-----------|----|--------|
| PowerShell | T1059.001 | Encoded commands, IEX, DownloadString |
| Windows Command Shell | T1059.003 | cmd.exe staging |
| Scheduled Task | T1053.005 | Task persistence + execution |
| User Execution: Malicious File | T1204.002 | Victim opens attachment |
| MSHTA | T1218.005 | HTA file execution |

### Persistence
| Technique | ID | Detail |
|-----------|----|--------|
| Registry Run Keys | T1547.001 | HKCU/HKLM Run keys |
| Scheduled Task | T1053.005 | Schtasks.exe or COM-based |
| Print Processors | T1547.012 | Registry-based print processor hijack |
| Port Monitors | T1547.010 | DLL injection via port monitor |
| DLL Search Order Hijacking | T1574.001 | BOOSTWRITE drops DLL in search path |
| BITS Jobs | T1197 | Persistence + download via bitsadmin |

### Privilege Escalation
| Technique | ID | Detail |
|-----------|----|--------|
| UAC Bypass | T1548.002 | fodhelper.exe, eventvwr.exe |
| Access Token Manipulation | T1134 | Token impersonation |

### Defense Evasion
| Technique | ID | Detail |
|-----------|----|--------|
| Obfuscated Files | T1027 | Base64, XOR, custom encoding |
| Masquerading | T1036 | Fake svchost.exe, explorer.exe |
| BITS Jobs | T1197 | Evades application whitelisting |
| Indicator Removal | T1070 | Log clearing, file deletion |
| Signed Binary Proxy Execution | T1218 | rundll32, msiexec, mshta abuse |

### Lateral Movement
| Technique | ID | Detail |
|-----------|----|--------|
| RDP | T1021.001 | Post-compromise lateral movement |
| WinRM | T1021.006 | PSRemoting, wsmprovhost.exe |
| Pass-the-Hash | T1550.002 | NTLM hash reuse |
| SMB/Windows Admin Shares | T1021.002 | C$ share access |

### Credential Access
| Technique | ID | Detail |
|-----------|----|--------|
| LSASS Memory | T1003.001 | Mimikatz, procdump on lsass |
| Keylogging | T1056.001 | Carbanak built-in keylogger |
| Credential API Hooking | T1056.004 | Hooks WinAPI for creds |
| Browser Credentials | T1555.003 | Chrome/Firefox credential theft |

### Collection
| Technique | ID | Detail |
|-----------|----|--------|
| Clipboard Data | T1115 | Live clipboard monitoring |
| Screen Capture | T1113 | Carbanak screenshots |
| Keylogging | T1056.001 | Carbanak keylogger |
| Data from Local System | T1005 | File staging before exfil |

### Exfiltration
| Technique | ID | Detail |
|-----------|----|--------|
| Exfil over C2 | T1041 | Data piggybacked on C2 channel |
| Encrypted Channel | T1573 | HTTPS C2 comms |
| Data Transfer Size Limits | T1030 | Staged small transfers |

---

## IOCs

### Known Malicious File Names / Paths
```
svchost.exe          (in non-standard paths like C:\Users\*)
csrss.exe            (outside System32)
explorer.exe         (outside C:\Windows\)
msiexec.exe          (with unusual params)
%TEMP%\*.exe
%APPDATA%\Roaming\Microsoft\Windows\*.dll
C:\ProgramData\[random]\
```

### Registry Keys Used for Persistence
```
HKCU\Software\Microsoft\Windows\CurrentVersion\Run
HKLM\Software\Microsoft\Windows\CurrentVersion\Run
HKLM\SYSTEM\CurrentControlSet\Control\Print\Monitors\
HKLM\SYSTEM\CurrentControlSet\Control\Print\Processors\
```

### Known C2 Patterns
- HTTP/HTTPS to non-CDN IPs on ports 80, 443, 8080, 8443
- Beaconing interval: 60–300 seconds
- User-Agent strings mimicking IE/Chrome but slightly malformed
- JA3 fingerprints associated with Carbanak C2

### Known Malware Hashes (representative samples)
```
Carbanak/Anunak loader:
  MD5:  d27e83d38e43be107b47c5d27b75bfc7
  SHA256: 3b6e9a8f7c2d4e1a9b0c5d8e2f4a7b3c6d9e0f1a2b4c5d6e7f8a9b0c1d2e3f4

BOOSTWRITE:
  SHA256: 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8

BABYMETAL:
  SHA256: 1f2e3d4c5b6a7988776655443322110099887766554433221100998877665544
```

> Note: Use these hash patterns for lab simulation. Real IOC databases: VirusTotal, MISP, CISA advisories.

---

## Key Windows Event IDs for FIN7 Hunting

| Event ID | Log | What to Hunt |
|----------|-----|--------------|
| 4688 | Security | Process creation — powershell, rundll32, mshta, cmd |
| 4697 | Security | New service installation |
| 4698 | Security | Scheduled task created |
| 4720 | Security | User account created |
| 4732 | Security | Member added to local admin group |
| 4624 | Security | Successful logon — type 3 (network), type 10 (RDP) |
| 4625 | Security | Failed logon — brute force |
| 4648 | Security | Explicit credentials used (runas, lateral move) |
| 1102 | Security | Audit log cleared |
| 4719 | Security | Audit policy changed |
| 7045 | System | Service installed |
| 1 | Sysmon | Process create (with command line) |
| 3 | Sysmon | Network connection |
| 7 | Sysmon | Image loaded (DLL) |
| 8 | Sysmon | CreateRemoteThread |
| 10 | Sysmon | ProcessAccess (LSASS) |
| 11 | Sysmon | File created |
| 13 | Sysmon | Registry value set |

---

## Suspicious Process Chains (Parent → Child)

```
WINWORD.EXE      → cmd.exe / powershell.exe / wscript.exe
EXCEL.EXE        → cmd.exe / powershell.exe / mshta.exe
explorer.exe     → mshta.exe / rundll32.exe / wscript.exe
services.exe     → powershell.exe  (unusual)
svchost.exe      → cmd.exe / powershell.exe (unusual)
```

---

## Hunting Approach for the Lab

1. **Start with process creation (Event 4688 / Sysmon 1)** — look for LOLBins with suspicious args
2. **Hunt encoded PowerShell** — `-enc`, `-EncodedCommand`, `IEX`, `DownloadString`
3. **Check scheduled tasks (4698)** — new tasks post initial compromise time
4. **Registry run keys (Sysmon 13)** — new persistence entries
5. **Lateral movement (4624 type 10, 4648)** — source/dest correlation
6. **LSASS access (Sysmon 10)** — credential theft attempt
7. **Network beaconing (Sysmon 3)** — regular intervals to same external IP
8. **Log clearing (1102)** — attacker covering tracks at end

---

## Common Exam Question Patterns

- "What process was used to execute the initial payload?"
- "What registry key was used for persistence?"
- "What user account was created/compromised?"
- "What external IP/domain did the malware communicate with?"
- "What technique was used to escalate privileges?"
- "What was the first indicator of compromise?"
- "At what time did lateral movement occur?"
