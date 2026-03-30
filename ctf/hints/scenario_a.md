# Hints — Scenario A: Clipboard Data Theft

> Read one hint at a time. Try to solve it before moving to the next.

---

## Hint A1 — Getting Started
Look at NFC-WS-041 activity around 09:00–10:00.
Something unusual was opened from Outlook's temp cache folder.
Which Office application spawned a PowerShell process?

---

## Hint A2 — Finding the Payload
The malware disguised itself as a legitimate Windows process name.
Check Sysmon EventID=11 (file created) events on NFC-WS-041.
Where was the file dropped? Hint: it's NOT in System32.

---

## Hint A3 — The Smoking Gun
```spl
index=windows host=NFC-WS-041 | where EventID=1
| search CommandLine="*Clipboard*"
| table TimeCreated, CommandLine
```
Read the full CommandLine — what .NET assembly is loaded?
What does the `while($true)` loop do with clipboard content?

---

## Hint A4 — PowerShell ScriptBlock Logs
Windows logs every script PowerShell runs in Event ID 4104.
These logs show the **decoded** commands — even when `-enc` base64 was used.
```spl
index=windows host=NFC-WS-041 | where EventCode=4104
| table TimeCreated, ScriptBlockText
| sort TimeCreated
```
Read each ScriptBlockText entry. One of them downloads the payload.
Another one reveals the BTC wallet address the attacker was swapping to.

---

## Hint A5 — Second Persistence (Scheduled Task)
Beyond the Run registry key, the malware also created a scheduled task.
```spl
index=windows host=NFC-WS-041 | where EventCode=4698
| table TimeCreated, SubjectUserName, TaskName
```
What is the full task path (starts with `\Microsoft\Windows\...`)?
