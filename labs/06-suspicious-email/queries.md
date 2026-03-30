# Lab 06 — Suspicious Email IR: Queries & Commands

## Email Header Analysis

### Parse Email Headers Manually
```bash
# Extract headers from .eml file
cat suspicious.eml | head -100

# Get sending IP from Received headers
grep -i "received:" suspicious.eml

# Get authentication results
grep -i "authentication-results" suspicious.eml
grep -i "dkim-signature" suspicious.eml
grep -i "received-spf" suspicious.eml

# Extract URLs from email body
grep -oE 'https?://[^"<> ]+' suspicious.eml

# Extract attachment info
grep -i "content-disposition" suspicious.eml
grep -i "filename" suspicious.eml
```

### Online Header Analysis
```
MXToolbox Header Analyzer: mxtoolbox.com/EmailHeaders.aspx
Google Admin Toolbox: toolbox.googleapps.com/apps/messageheader/
```

---

## Splunk Queries

### Find phishing email arrival (if mail logs in Splunk)
```spl
index=* sourcetype=exchange OR sourcetype=smtp OR sourcetype=postfix
| where like(sender, "%@%.%") AND like(subject, "%invoice%")
      OR like(subject, "%urgent%") OR like(subject, "%payment%")
      OR like(subject, "%account%") OR like(subject, "%verify%")
| table _time, sender, recipient, subject, attachment_name, src_ip
| sort _time
```

### Process chain from Outlook/mail client
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(ParentImage, "%OUTLOOK.EXE%") OR like(ParentImage, "%WINWORD.EXE%")
      OR like(ParentImage, "%EXCEL.EXE%") OR like(ParentImage, "%ONENOTE.EXE%")
| table _time, ComputerName, User, ParentImage, Image, CommandLine
| sort _time
```

### PowerShell execution after email open
```spl
index=* (EventCode=4688 OR EventID=1) Image="*powershell.exe"
| where like(CommandLine, "%-enc%") OR like(CommandLine, "%DownloadString%")
      OR like(CommandLine, "%IEX%") OR like(CommandLine, "%Invoke-Expression%")
| table _time, ComputerName, User, CommandLine, ParentImage
```

### PowerShell script block logging (most valuable)
```spl
index=* EventCode=4104
| table _time, ComputerName, User, ScriptBlockText
| sort _time
```

### File drops to temp after email activity
```spl
index=* EventID=11
| where like(TargetFilename, "%\\Temp\\%") OR like(TargetFilename, "%\\AppData\\%")
| where like(TargetFilename, "%.exe") OR like(TargetFilename, "%.dll")
      OR like(TargetFilename, "%.ps1") OR like(TargetFilename, "%.vbs")
      OR like(TargetFilename, "%.hta")
| table _time, ComputerName, User, Image, TargetFilename
```

### Network connection from suspicious process
```spl
index=* EventID=3
| where NOT like(DestinationIp, "10.%") AND NOT like(DestinationIp, "192.168.%")
      AND NOT like(DestinationIp, "172.16.%")
| where like(Image, "%\\Temp\\%") OR like(Image, "%\\AppData\\%")
      OR like(Image, "%powershell%") OR like(Image, "%mshta%")
| table _time, ComputerName, User, Image, DestinationIp, DestinationPort, DestinationHostname
```

### Persistence after phishing
```spl
index=* (EventCode=4698 OR EventID=13)
| eval type=if(EventCode=4698, "Scheduled Task", "Registry")
| where EventCode=4698 OR like(TargetObject, "%\\CurrentVersion\\Run%")
| table _time, ComputerName, User, type, TaskName, TargetObject, Details
```

### Account creation post-compromise
```spl
index=* EventCode=4720
| table _time, ComputerName, SubjectUserName, TargetUserName
```

### Lateral movement after initial compromise
```spl
index=* EventCode=4624 (LogonType=3 OR LogonType=10)
| where NOT like(IpAddress, "127.%") AND NOT like(IpAddress, "::1")
| table _time, ComputerName, TargetUserName, IpAddress, LogonType, WorkstationName
| sort _time
```

### Full IR Timeline (combine all indicators)
```spl
index=* (
  (EventCode=4688 AND (ParentImage="*OUTLOOK*" OR ParentImage="*WINWORD*" OR ParentImage="*ONENOTE*"))
  OR EventCode=4698
  OR EventCode=4720
  OR EventCode=4732
  OR (EventCode=4624 AND LogonType IN (3, 10))
  OR EventID=3
  OR EventID=11
  OR EventID=13
  OR EventCode=4104
)
| eval event_type=case(
    EventCode=4688, "Process Exec",
    EventCode=4698, "Scheduled Task",
    EventCode=4720, "Account Created",
    EventCode=4732, "Admin Group Add",
    EventCode=4624, "Logon",
    EventCode=4104, "PowerShell",
    EventID=3, "Network Conn",
    EventID=11, "File Drop",
    EventID=13, "Registry Mod"
  )
| table _time, event_type, ComputerName, User, CommandLine, TargetFilename, DestinationIp
| sort _time
```

---

## Email Artifact Investigation (Windows Commands)

### Check Outlook temp attachments
```powershell
# Outlook secure temp folder
$regPath = "HKCU:\Software\Microsoft\Office\*\Outlook\Security"
Get-ItemProperty $regPath | Select-Object OutlookSecureTempFolder

# List temp attachment files
$tempPath = (Get-ItemProperty "HKCU:\Software\Microsoft\Office\16.0\Outlook\Security").OutlookSecureTempFolder
Get-ChildItem $tempPath -Force
```

### Check recent files (LNK artifacts)
```powershell
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Recent\" | Sort-Object LastWriteTime -Descending | Select-Object Name, LastWriteTime -First 20
```

### Check prefetch for executed files
```powershell
# List prefetch (requires admin)
Get-ChildItem C:\Windows\Prefetch\ | Sort-Object LastWriteTime -Descending | Select-Object Name, LastWriteTime | head -30
```

### Check PowerShell history
```powershell
# Per-user PSReadLine history
Get-Content "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"

# All user profiles
Get-ChildItem "C:\Users\*\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt" | ForEach-Object { "=== $($_.FullName) ==="; Get-Content $_ }
```

### Check browser download history
```powershell
# Chrome downloads (SQLite)
$chromePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\History"
Copy-Item $chromePath "$env:TEMP\ChromeHistory"
# Then open with SQLite browser or:
# sqlite3 "$env:TEMP\ChromeHistory" "SELECT target_path, tab_url, start_time FROM downloads ORDER BY start_time DESC LIMIT 20;"
```

---

## Wireshark (if PCAP from email incident)
```wireshark
# Find C2 callback
http.request.method == "POST" and frame.len > 200

# Find payload download
http.request.uri contains ".exe" or http.request.uri contains ".ps1"

# Find beaconing
http and ip.dst == SUSPECTED_C2_IP

# Find exfiltration
http.request.method == "POST" and ip.dst != KNOWN_INTERNAL_IP
```

---

## IOC Extraction Summary

After analysis, document:
```
Date/Time of email:
Sender address:
Sender IP:
SPF/DKIM/DMARC:        FAIL/PASS
Subject:
Attachment name:
Attachment hash (SHA256):
C2 IP/Domain:
Malware dropped:
Persistence location:
Accounts compromised:
Lateral movement to:
Data exfiltrated:
```
