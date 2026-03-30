# Lab 01 — Clipboard Data Theft: Queries & Commands

## Splunk Queries

### Find processes accessing clipboard via PowerShell
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(CommandLine, "%Clipboard%") OR like(CommandLine, "%GetClipboard%")
      OR like(CommandLine, "%Get-Clipboard%") OR like(CommandLine, "%ClipboardData%")
| table _time, ComputerName, User, Image, CommandLine, ParentImage
```

### Suspicious script execution from temp locations
```spl
index=* (EventCode=4688 OR EventID=1)
| where (like(Image, "%\\Temp\\%") OR like(Image, "%\\AppData\\%"))
      AND (like(Image, "%.exe") OR like(Image, "%.ps1"))
| table _time, ComputerName, User, Image, CommandLine, ParentImage
```

### Network connections from suspicious processes
```spl
index=* EventID=3
| where NOT like(DestinationIp, "10.%")
      AND NOT like(DestinationIp, "192.168.%")
      AND (like(Image, "%\\Temp\\%") OR like(Image, "%\\AppData\\%"))
| table _time, ComputerName, Image, DestinationIp, DestinationPort
```

### Files written to temp after clipboard access
```spl
index=* EventID=11
| where like(TargetFilename, "%\\Temp\\%") OR like(TargetFilename, "%\\AppData\\%")
| table _time, ComputerName, User, Image, TargetFilename
| sort _time
```

### Process injection (clipboard via injected code)
```spl
index=* EventID=10
| where NOT like(SourceImage, "%\\Windows\\System32\\%")
| table _time, ComputerName, SourceImage, TargetImage, GrantedAccess
```

### Registry persistence check
```spl
index=* EventID=13
| where like(TargetObject, "%\\CurrentVersion\\Run%")
| table _time, ComputerName, User, TargetObject, Details, Image
```

---

## Windows CLI / PowerShell Investigation

### Check running processes with clipboard access
```powershell
Get-Process | Where-Object {$_.MainWindowTitle -eq ""} | Select-Object Name, Id, Path, StartTime
```

### Check process command lines
```powershell
Get-WmiObject Win32_Process | Select-Object Name, ProcessId, CommandLine, ParentProcessId | Where-Object {$_.CommandLine -like "*clip*"}
```

### List scheduled tasks
```powershell
Get-ScheduledTask | Where-Object {$_.State -eq "Ready"} | Select-Object TaskName, TaskPath
```

### Check Run key persistence
```powershell
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
```

### Decode base64 from clipboard tool output
```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("BASE64STRING"))
```

---

## Volatility (Memory Forensics)

```bash
# List processes
vol.py -f memory.dmp --profile=Win10x64 pslist

# Process tree (find suspicious parent-child)
vol.py -f memory.dmp --profile=Win10x64 pstree

# Command line arguments
vol.py -f memory.dmp --profile=Win10x64 cmdline

# Clipboard data from memory
vol.py -f memory.dmp --profile=Win10x64 clipboard

# Network connections
vol.py -f memory.dmp --profile=Win10x64 netscan

# Dump suspicious process memory
vol.py -f memory.dmp --profile=Win10x64 memdump -p PID -D ./output/
```

---

## Wireshark Filters (if PCAP available)

```wireshark
# HTTP POST (likely exfil)
http.request.method == "POST"

# Small periodic requests (beaconing)
http && frame.len < 500

# Suspicious user agent
http.user_agent contains "curl" or http.user_agent contains "python"

# DNS to suspicious domains
dns.qry.name contains "pastebin" or dns.qry.name contains "bit.ly"
```
