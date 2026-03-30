# Lab 02 — Malicious Account Creation: Splunk Queries

## Quick Overview — What Events Exist
```spl
index=* sourcetype=WinEventLog:Security
| stats count by EventCode
| sort -count
```

---

## 1. Account Creation Events

### All account creation events
```spl
index=* EventCode=4720
| table _time, ComputerName, SubjectUserName, SubjectDomainName, TargetUserName, TargetDomainName
| sort _time
```

### Account created + immediately added to admin group
```spl
index=* (EventCode=4720 OR EventCode=4732 OR EventCode=4728)
| eval event_type=case(EventCode=4720,"Account Created", EventCode=4732,"Added to Local Group", EventCode=4728,"Added to Global Group")
| table _time, ComputerName, SubjectUserName, TargetUserName, event_type
| sort _time
```

### Account created outside business hours (before 8am or after 6pm)
```spl
index=* EventCode=4720
| eval hour=strftime(_time, "%H")
| where hour < 8 OR hour > 18
| table _time, ComputerName, SubjectUserName, TargetUserName
```

---

## 2. Privilege Escalation via Group Membership

### User added to Administrators group
```spl
index=* EventCode=4732
| where like(TargetUserName, "%Admin%") OR TargetUserName="Administrators"
| table _time, ComputerName, SubjectUserName, MemberName, TargetUserName
```

### User added to Domain Admins
```spl
index=* EventCode=4728
| where TargetUserName="Domain Admins"
| table _time, ComputerName, SubjectUserName, MemberName, TargetUserName
```

### Combined: new account + added to privileged group within 10 min
```spl
index=* (EventCode=4720 OR EventCode=4732)
| eval account=coalesce(TargetUserName, MemberName)
| stats min(_time) as first_seen, values(EventCode) as events, values(ComputerName) as hosts by account
| where mvcount(events) > 1
| sort first_seen
```

---

## 3. Process-Based Detection

### net.exe / net1.exe user add
```spl
index=* (EventCode=4688 OR EventID=1)
| where (like(Image, "%\\net.exe") OR like(Image, "%\\net1.exe"))
      AND like(CommandLine, "%user%") AND like(CommandLine, "%/add%")
| table _time, ComputerName, User, Image, CommandLine, ParentImage
```

### PowerShell account creation
```spl
index=* (EventCode=4688 OR EventID=1) Image="*powershell.exe"
| where like(CommandLine, "%New-LocalUser%") OR like(CommandLine, "%New-ADUser%")
      OR like(CommandLine, "%net user%")
| table _time, ComputerName, User, CommandLine
```

### WMI account creation
```spl
index=* (EventCode=4688 OR EventID=1) Image="*wmic.exe"
| where like(CommandLine, "%useraccount%") OR like(CommandLine, "%create%")
| table _time, ComputerName, User, CommandLine
```

### dsadd for domain account creation
```spl
index=* (EventCode=4688 OR EventID=1) Image="*dsadd.exe"
| table _time, ComputerName, User, CommandLine
```

---

## 4. Account Usage After Creation

### Logon events for newly created account
```spl
index=* EventCode=4624
| where TargetUserName="ACCOUNT_NAME_HERE"
| table _time, ComputerName, TargetUserName, LogonType, IpAddress, WorkstationName
```

### All logons from suspicious account (replace account name)
```spl
index=* EventCode=4624 TargetUserName="svc_backup"
| table _time, ComputerName, TargetUserName, LogonType, IpAddress
| sort _time
```

### Failed logons (brute forcing new account password)
```spl
index=* EventCode=4625
| stats count by TargetUserName, IpAddress, ComputerName
| where count > 5
| sort -count
```

---

## 5. Correlate: Creation → Group Add → First Logon

```spl
index=* (EventCode=4720 OR EventCode=4732 OR EventCode=4624)
| eval event_type=case(
    EventCode=4720, "1_CREATED",
    EventCode=4732, "2_GROUP_ADD",
    EventCode=4624, "3_LOGON"
  )
| eval actor=coalesce(TargetUserName, MemberName)
| table _time, event_type, actor, SubjectUserName, ComputerName, IpAddress
| sort actor, _time
```

---

## 6. Password Changes & Account Manipulation

### Password reset events
```spl
index=* (EventCode=4723 OR EventCode=4724)
| table _time, ComputerName, SubjectUserName, TargetUserName, EventCode
```

### Account attribute changes (flags, group membership)
```spl
index=* EventCode=4738
| table _time, ComputerName, SubjectUserName, TargetUserName, UserAccountControl
```

---

## 7. Account Deletion (Cleanup / Covering Tracks)

```spl
index=* EventCode=4726
| table _time, ComputerName, SubjectUserName, TargetUserName
```

---

## 8. Summary Dashboard Query

```spl
index=* EventCode IN (4720, 4722, 4724, 4725, 4726, 4728, 4732, 4738)
| eval action=case(
    EventCode=4720, "Account Created",
    EventCode=4722, "Account Enabled",
    EventCode=4724, "Password Reset",
    EventCode=4725, "Account Disabled",
    EventCode=4726, "Account Deleted",
    EventCode=4728, "Added to Global Group",
    EventCode=4732, "Added to Local Group",
    EventCode=4738, "Account Changed"
  )
| table _time, action, ComputerName, SubjectUserName, TargetUserName
| sort _time
```
