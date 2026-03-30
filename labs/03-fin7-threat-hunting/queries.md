# Lab 03 — FIN7 Splunk Hunting Queries

## Quick-Start: Broad Sweep First

```spl
index=* sourcetype=WinEventLog:Security OR sourcetype=XmlWinEventLog:Security
| stats count by EventCode
| sort -count
```

```spl
index=* sourcetype=XmlWinEventLog:Microsoft-Windows-Sysmon/Operational
| stats count by EventID
| sort -count
```

---

## 1. Initial Access — Phishing / Macro Execution

### Office spawning suspicious children
```spl
index=* EventCode=4688 OR EventID=1
| where ParentImage IN ("*WINWORD.EXE", "*EXCEL.EXE", "*POWERPNT.EXE", "*OUTLOOK.EXE")
| where Image IN ("*cmd.exe", "*powershell.exe", "*wscript.exe", "*cscript.exe",
                  "*mshta.exe", "*rundll32.exe", "*regsvr32.exe")
| table _time, ComputerName, ParentImage, Image, CommandLine
| sort _time
```

### HTA file execution (T1218.005)
```spl
index=* (EventCode=4688 OR EventID=1) Image="*mshta.exe"
| table _time, ComputerName, Image, CommandLine, ParentImage
```

---

## 2. Execution — PowerShell Hunting

### Encoded PowerShell (most common FIN7 pattern)
```spl
index=* (EventCode=4688 OR EventID=1) Image="*powershell.exe"
| where like(CommandLine, "%-enc%") OR like(CommandLine, "%-EncodedCommand%")
      OR like(CommandLine, "%IEX%") OR like(CommandLine, "%Invoke-Expression%")
      OR like(CommandLine, "%DownloadString%") OR like(CommandLine, "%FromBase64%")
| table _time, ComputerName, User, CommandLine, ParentImage
| sort _time
```

### PowerShell with AMSI bypass indicators
```spl
index=* (EventCode=4688 OR EventID=1) Image="*powershell.exe"
| where like(CommandLine, "%-nop%") OR like(CommandLine, "%-NonInteractive%")
      OR like(CommandLine, "%-WindowStyle Hidden%") OR like(CommandLine, "%-w hidden%")
| table _time, ComputerName, User, CommandLine
```

### PowerShell download cradle
```spl
index=* (EventCode=4688 OR EventID=1) Image="*powershell.exe"
| where like(CommandLine, "%Net.WebClient%") OR like(CommandLine, "%WebRequest%")
      OR like(CommandLine, "%DownloadFile%") OR like(CommandLine, "%DownloadString%")
      OR like(CommandLine, "%BitsTransfer%")
| table _time, ComputerName, User, CommandLine
```

---

## 3. Persistence — Registry Run Keys

### New Run key entries (Sysmon EventID 13)
```spl
index=* EventID=13
| where like(TargetObject, "%\\CurrentVersion\\Run%")
      OR like(TargetObject, "%\\CurrentVersion\\RunOnce%")
| table _time, ComputerName, User, TargetObject, Details, Image
| sort _time
```

### Print Monitor / Print Processor persistence (FIN7 specialty)
```spl
index=* EventID=13
| where like(TargetObject, "%\\Control\\Print\\Monitors%")
      OR like(TargetObject, "%\\Control\\Print\\Processors%")
| table _time, ComputerName, TargetObject, Details, Image
```

### Scheduled task creation (Event 4698)
```spl
index=* EventCode=4698
| table _time, ComputerName, SubjectUserName, TaskName, TaskContent
| sort _time
```

### Scheduled task via schtasks.exe
```spl
index=* (EventCode=4688 OR EventID=1) Image="*schtasks.exe"
| where like(CommandLine, "%/create%") OR like(CommandLine, "%/sc%")
| table _time, ComputerName, User, CommandLine
```

---

## 4. Privilege Escalation — UAC Bypass

### fodhelper UAC bypass
```spl
index=* (EventCode=4688 OR EventID=1) Image="*fodhelper.exe"
| where NOT like(ParentImage, "%explorer.exe")
| table _time, ComputerName, User, Image, ParentImage, CommandLine
```

### eventvwr UAC bypass
```spl
index=* (EventCode=4688 OR EventID=1) Image="*eventvwr.exe"
| where NOT like(ParentImage, "%explorer.exe")
| table _time, ComputerName, User, Image, ParentImage, CommandLine
```

---

## 5. Defense Evasion — LOLBins

### BITS abuse (bitsadmin)
```spl
index=* (EventCode=4688 OR EventID=1) Image="*bitsadmin.exe"
| where like(CommandLine, "%/transfer%") OR like(CommandLine, "%/download%")
| table _time, ComputerName, User, CommandLine
```

### Rundll32 with suspicious targets
```spl
index=* (EventCode=4688 OR EventID=1) Image="*rundll32.exe"
| where NOT like(CommandLine, "%shell32.dll%")
      AND NOT like(CommandLine, "%printui.dll%")
| table _time, ComputerName, User, CommandLine, ParentImage
```

### Regsvr32 (squiblydoo - T1218.010)
```spl
index=* (EventCode=4688 OR EventID=1) Image="*regsvr32.exe"
| where like(CommandLine, "%/s%") AND like(CommandLine, "%/u%")
      OR like(CommandLine, "%scrobj.dll%")
| table _time, ComputerName, User, CommandLine
```

### Process masquerading (svchost outside System32)
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(Image, "%svchost.exe") AND NOT like(Image, "%\\Windows\\System32\\%")
      AND NOT like(Image, "%\\Windows\\SysWOW64\\%")
| table _time, ComputerName, User, Image, CommandLine, ParentImage
```

---

## 6. Credential Access

### LSASS access (Sysmon EventID 10)
```spl
index=* EventID=10 TargetImage="*lsass.exe"
| where NOT like(SourceImage, "%\\Windows\\System32\\%")
      AND NOT like(SourceImage, "%\\Windows\\SysWOW64\\%")
| table _time, ComputerName, SourceImage, TargetImage, GrantedAccess
```

### Procdump or task manager on lsass
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(CommandLine, "%lsass%") AND (
    like(Image, "%procdump%") OR like(Image, "%taskmgr%") OR like(Image, "%rundll32%"))
| table _time, ComputerName, User, Image, CommandLine
```

### New user account created (T1136)
```spl
index=* EventCode=4720
| table _time, ComputerName, SubjectUserName, TargetUserName, TargetDomainName
```

### User added to admin group (T1098)
```spl
index=* EventCode=4732
| where like(TargetUserName, "%Admin%") OR like(TargetUserName, "%Administrator%")
| table _time, ComputerName, SubjectUserName, TargetUserName, MemberName
```

---

## 7. Lateral Movement

### RDP lateral movement (logon type 10)
```spl
index=* EventCode=4624 LogonType=10
| table _time, ComputerName, TargetUserName, IpAddress, IpPort, LogonType
| sort _time
```

### Explicit credentials used (pass-the-hash / runas)
```spl
index=* EventCode=4648
| where NOT like(SubjectUserName, "%$")
| table _time, ComputerName, SubjectUserName, TargetUserName, TargetServerName, IpAddress
```

### SMB admin share access
```spl
index=* EventCode=5140
| where like(ShareName, "%Admin$%") OR like(ShareName, "%C$%") OR like(ShareName, "%IPC$%")
| table _time, ComputerName, SubjectUserName, IpAddress, ShareName
```

### WinRM / PSRemoting
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(Image, "%wsmprovhost.exe") OR like(Image, "%winrshost.exe")
| table _time, ComputerName, User, Image, ParentImage, CommandLine
```

---

## 8. Network / C2 Hunting

### Unusual outbound connections (Sysmon EventID 3)
```spl
index=* EventID=3
| where NOT like(DestinationIp, "10.%")
      AND NOT like(DestinationIp, "192.168.%")
      AND NOT like(DestinationIp, "172.%")
      AND NOT (DestinationPort=80 OR DestinationPort=443 OR DestinationPort=53)
| table _time, ComputerName, Image, SourceIp, SourcePort, DestinationIp, DestinationPort
| sort _time
```

### Beaconing detection (regular interval pattern)
```spl
index=* EventID=3
| where NOT like(DestinationIp, "10.%") AND NOT like(DestinationIp, "192.168.%")
| bin _time span=1m
| stats count by _time, DestinationIp, DestinationPort
| where count >= 3
| sort DestinationIp, _time
```

### Suspicious user-agent in HTTP traffic (if web proxy logs available)
```spl
index=* sourcetype=proxy OR sourcetype=squid OR sourcetype=bluecoat
| where like(cs_useragent, "%MSIE%") AND like(url, "%/gate%")
      OR like(cs_useragent, "%WinHttp%")
| table _time, src, dest, url, cs_useragent
```

---

## 9. Collection & Exfiltration

### Clipboard / screen capture processes
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(CommandLine, "%clip%") OR like(CommandLine, "%clipboard%")
| table _time, ComputerName, User, Image, CommandLine
```

### Large file staging before exfil
```spl
index=* EventID=11
| where like(TargetFilename, "%\\AppData\\%")
      OR like(TargetFilename, "%\\Temp\\%")
| stats sum(eval(if(isnum(file_size), file_size, 0))) as total_bytes by ComputerName, TargetFilename
| where total_bytes > 10000000
```

---

## 10. Cleanup / Anti-Forensics

### Audit log cleared
```spl
index=* EventCode=1102 OR EventCode=517
| table _time, ComputerName, SubjectUserName
```

### Audit policy changed
```spl
index=* EventCode=4719
| table _time, ComputerName, SubjectUserName, AuditPolicyChanges
```

### File deletion (Sysmon — via process activity)
```spl
index=* EventID=23
| table _time, ComputerName, Image, TargetFilename, User
```

---

## Timeline Reconstruction Query

```spl
index=* (EventCode IN (4688, 4698, 4720, 4732, 4624, 4648, 1102)
         OR EventID IN (1, 3, 10, 11, 13))
| eval technique=case(
    EventCode=4688 OR EventID=1, "Process Execution",
    EventCode=4698, "Scheduled Task",
    EventCode=4720, "Account Created",
    EventCode=4732, "Admin Group Modified",
    EventCode=4624, "Logon",
    EventCode=4648, "Explicit Creds",
    EventCode=1102, "Log Cleared",
    EventID=3, "Network Connection",
    EventID=10, "LSASS Access",
    EventID=13, "Registry Modified",
    true(), "Other"
  )
| table _time, technique, ComputerName, User, CommandLine, DestinationIp
| sort _time
```

---

## Tips for the Exam

1. Always check the **time range** first — set it wide then narrow down
2. Use `stats count by EventCode` to see what's available before hunting
3. `| head 20` while exploring, remove when confident
4. Look for **outliers** — single occurrence of a process from an unusual parent
5. Use `| rex` to extract encoded commands from CommandLine if needed:
   ```spl
   | rex field=CommandLine "(?i)-enc(?odedCommand)?\s+(?P<encoded_cmd>[A-Za-z0-9+/=]+)"
   | eval decoded=base64decode(encoded_cmd)
   ```
