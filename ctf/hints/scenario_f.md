# Hints — Scenario F: Packet Analysis

> Read one hint at a time. Try to solve it before moving to the next.

---

## Hint F1 — Getting Started
Focus on NFC-SENSOR around 17:00.
This host captures raw network traffic at the perimeter.
Start by looking at all events from this sensor:
```spl
index=network host=NFC-SENSOR | table TimeCreated, src_ip, dst_ip, dst_port, app, action | sort TimeCreated
```
What external IP appears most frequently, and what is it doing?

---

## Hint F2 — Port Scan Pattern
Look for the same source IP hitting multiple destination ports in rapid succession.
```spl
index=network host=NFC-SENSOR | where src_ip="185.220.101.45"
| stats count by dst_port, action
| sort dst_port
```
Which ports got an `allow` response? Those are the open ports.

---

## Hint F3 — Cleartext Credentials
After the scan, the attacker connected to an open service that sends credentials in plaintext.
```spl
index=network host=NFC-SENSOR | where app="ftp"
| table TimeCreated, src_ip, ftp_command, bytes_out
| sort TimeCreated
```
Read the `ftp_command` field carefully — both the username and password are visible.
Then check what file was retrieved with the `RETR` command.
