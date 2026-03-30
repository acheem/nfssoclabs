# Hints — Scenario E: Suspicious Email / Evidence of Compromise

> Read one hint at a time. Try to solve it before moving to the next.

---

## Hint E1 — Getting Started
Focus on NFC-WS-063 around 15:00–16:00.
A legitimate-looking document delivery service was used as a lure.
Look for Chrome being spawned by Outlook:
```spl
index=windows host=NFC-WS-063 | where EventCode=4688
| search ParentProcessName="*OUTLOOK*"
| table TimeCreated, NewProcessName, CommandLine
```

---

## Hint E2 — HTML Smuggling
The HTML file dropped something to the Downloads folder.
```spl
index=windows host=NFC-WS-063 | where EventID=11
| table TimeCreated, Image, TargetFilename
```
What file was created? This technique is called HTML smuggling —
the file is assembled from base64 inside the HTML using JavaScript.

---

## Hint E3 — Exfiltration Evidence
After the executable ran, check Sysmon EventID=3 for outbound connections.
```spl
index=windows host=NFC-WS-063 | where EventID=3
| table TimeCreated, Image, DestinationIp, DestinationPort
```
Then check the firewall logs for the same destination:
```spl
index=network host=NFC-FW-01 | search src_ip="10.10.1.63"
| table TimeCreated, dst_ip, bytes_out
```
Large `bytes_out` = data was exfiltrated.
