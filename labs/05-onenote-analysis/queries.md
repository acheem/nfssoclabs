# Lab 05 — Malicious OneNote: Analysis Commands & Queries

## Static Analysis Commands

### Initial File Check
```bash
# Check file type
file suspicious.one

# Magic bytes (should start with D0 CF 11 E0 for CFBF/OLE)
xxd suspicious.one | head -2

# File size and hash
sha256sum suspicious.one
md5sum suspicious.one
```

### String Extraction
```bash
# All strings
strings suspicious.one

# Filter for suspicious patterns
strings suspicious.one | grep -iE "(http|https|ftp)://"
strings suspicious.one | grep -iE "(powershell|mshta|wscript|cmd\.exe|rundll32)"
strings suspicious.one | grep -iE "(\.exe|\.dll|\.ps1|\.vbs|\.hta|\.bat|\.cmd)"
strings suspicious.one | grep -iE "(download|invoke|base64|frombase64|iex)"
strings suspicious.one | grep -iE "(\\\\temp|appdata|programdata)"

# Wide strings (Unicode)
strings -el suspicious.one | grep -iE "http"
```

### OLE / Embedded Object Extraction
```bash
# Install olentools
pip install olentools

# Identify OLE file info
oleid suspicious.one

# List and extract embedded objects
oleobj suspicious.one

# Extract to directory
oleobj -d ./extracted/ suspicious.one

# Check for VBA (sometimes present)
olevba suspicious.one

# Recursive analysis
mraptor suspicious.one
```

### OneNote-Specific Tools
```bash
# OneNoteAnalyzer (if available)
OneNoteAnalyzer.exe suspicious.one

# Python-based parser
pip install onedump
onedump suspicious.one

# Search for embedded file signatures in hex
xxd suspicious.one | grep -i "4d 5a"    # EXE (MZ header)
xxd suspicious.one | grep -i "50 4b"    # ZIP
xxd suspicious.one | grep -i "3c 73 63" # <sc (script tag)
xxd suspicious.one | grep -i "7b 5c 72" # RTF
```

---

## Payload Decoding

### Base64 Decode
```bash
# Linux
echo "BASE64STRING" | base64 -d

# PowerShell (UTF-16LE encoded commands)
$encoded = "BASE64STRING"
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($encoded))
```

### PowerShell Deobfuscation
```powershell
# Run in safe environment — replace IEX with Write-Output
$script = "obfuscated_code_here"
# Replace: Invoke-Expression / IEX with: Write-Output

# Expand char arrays
[char]73 + [char]69 + [char]88   # IEX

# Decode concatenated strings
"In" + "vo" + "ke" + "-Ex" + "pression"   # = Invoke-Expression
```

### CyberChef Recipes (use at gchq.github.io/CyberChef)
```
# Decode base64 PowerShell
From_Base64 → Decode_text (UTF-16LE)

# URL decode
URL_Decode

# Multi-layer (common in malware)
From_Base64 → Inflate → From_Base64 → Decode_text
```

---

## Splunk Queries (Post-Execution Detection)

### OneNote spawning suspicious children
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(ParentImage, "%ONENOTE.EXE%") OR like(ParentImage, "%onenoteim.exe%")
| table _time, ComputerName, User, ParentImage, Image, CommandLine
```

### Temp file drops from OneNote
```spl
index=* EventID=11
| where like(TargetFilename, "%\\AppData\\Local\\Temp\\OneNote%")
      OR like(TargetFilename, "%\\AppData\\Local\\Temp\\%")
| where like(TargetFilename, "%.exe") OR like(TargetFilename, "%.ps1")
      OR like(TargetFilename, "%.hta") OR like(TargetFilename, "%.vbs")
      OR like(TargetFilename, "%.bat")
| table _time, ComputerName, User, Image, TargetFilename
```

### MSHTA execution (HTA payload)
```spl
index=* (EventCode=4688 OR EventID=1) Image="*mshta.exe"
| table _time, ComputerName, User, Image, CommandLine, ParentImage
```

### WScript/CScript execution (VBS/JS payload)
```spl
index=* (EventCode=4688 OR EventID=1)
| where like(Image, "%wscript.exe") OR like(Image, "%cscript.exe")
| table _time, ComputerName, User, Image, CommandLine, ParentImage
```

### PowerShell download after OneNote open
```spl
index=* EventID=3
| where like(Image, "%powershell.exe") OR like(Image, "%mshta.exe")
      OR like(Image, "%wscript.exe")
| where NOT like(DestinationIp, "10.%") AND NOT like(DestinationIp, "192.168.%")
| table _time, ComputerName, Image, DestinationIp, DestinationPort
```

---

## Dynamic Analysis Indicators to Watch

### Process Monitor Filters (ProcMon)
```
Process Name: ONENOTE.EXE
Operation: WriteFile → captures file drops

Process Name: mshta.exe OR wscript.exe
Operation: TCP Connect → C2 connection
```

### Wireshark During Execution
```wireshark
# Watch for C2 download
http.request.method == "GET" and http.request.uri contains ".ps1"

# Watch for payload download
http.request.uri contains ".exe" or http.request.uri contains ".dll"

# DNS for C2 domain
dns.flags.response == 0
```
