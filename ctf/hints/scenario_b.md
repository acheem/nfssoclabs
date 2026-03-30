# Hints — Scenario B: Malicious Account Creation

> Read one hint at a time. Try to solve it before moving to the next.

---

## Hint B1 — Getting Started
Focus on NFC-SRV-DC1 (Domain Controller).
Look for logon events with LogonType=10 — that means RDP.
Was the RDP connection from inside the network or from the internet?

---

## Hint B2 — Finding the Account
After the RDP connection, search for EventCode=4720 on NFC-SRV-DC1.
```spl
index=windows host=NFC-SRV-DC1 | where EventCode=4720
| table TimeCreated, SubjectUserName, TargetUserName
```
What account was created, and by whom?

---

## Hint B3 — Privilege Escalation
After finding the account, look for EventCode=4728 (added to global group).
What group name appears in TargetUserName?
Then check EventCode=1102 — what happened to cover the tracks?

