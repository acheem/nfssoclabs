# Hints — Scenario C: FIN7-Style RAT

> Read one hint at a time. Try to solve it before moving to the next.

---

## Hint C1 — Getting Started
Focus on NFC-WS-029 around 13:00–14:00.
Look for WINWORD.EXE spawning cmd.exe — this is almost never legitimate.
```spl
index=windows host=NFC-WS-029 | where EventCode=4688
| search ParentProcessName="*WINWORD*"
| table TimeCreated, NewProcessName, CommandLine
```

---

## Hint C2 — Decode the PowerShell
The CommandLine contains `-enc` followed by a base64 string.
Decode it with:
```powershell
[System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String("PASTE_BASE64_HERE"))
```
What URL does it contact? What file does it download?

---

## Hint C3 — Following the Chain
The dropped file masquerades as a Microsoft system component.
```spl
index=windows host=NFC-WS-029 | where EventID=11
| table TimeCreated, TargetFilename
```
Then look for Sysmon EventID=10 — which critical Windows process was accessed?
This tells you what credential theft technique was used.
