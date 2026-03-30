# Hints — Scenario D: Malicious OneNote

> Read one hint at a time. Try to solve it before moving to the next.

---

## Hint D1 — Getting Started
Focus on NFC-WS-058 around 14:00–14:30.
Search for ONENOTE.EXE in process creation events.
```spl
index=windows host=NFC-WS-058 | where EventCode=4688
| table TimeCreated, NewProcessName, CommandLine, ParentProcessName
| sort TimeCreated
```
What file did ONENOTE.EXE open, and where did it come from?

---

## Hint D2 — The Malicious Child Process
A OneNote file that spawns another process is a red flag.
What process did ONENOTE.EXE launch as a child?
Hint: it's a built-in Windows HTML application runner — not a browser.

---

## Hint D3 — Payload and C2
Follow the chain: ONENOTE → mshta → PowerShell → ?
```spl
index=windows host=NFC-WS-058 | where EventID=11
| table TimeCreated, Image, TargetFilename
```
Where was the payload dropped?
Then check Sysmon EventID=3 — what IP:port did it call home to?
