# Lab 02 — Splunk: Malicious Account Creation

## Attack Overview

Adversaries create new user accounts to maintain persistent access, evade detection by blending in with legitimate users, or escalate privileges.

**MITRE ATT&CK:**
- T1136.001 — Create Account: Local Account
- T1136.002 — Create Account: Domain Account
- T1098 — Account Manipulation

---

## Why Attackers Create Accounts

1. **Persistence** — survive credential rotations, password changes on compromised accounts
2. **Redundancy** — backup access if primary foothold is detected/removed
3. **Privilege** — create admin-level accounts for lateral movement
4. **Blending in** — name accounts similar to service accounts or IT staff
5. **Ransomware prep** — domain admin accounts for mass deployment

---

## Account Creation Methods

### Net Commands
```cmd
net user hacker P@ssw0rd123 /add
net localgroup Administrators hacker /add
net user /domain (enumerate domain users)
```

### PowerShell
```powershell
New-LocalUser -Name "svc_backup" -Password (ConvertTo-SecureString "P@ss!" -AsPlainText -Force)
Add-LocalGroupMember -Group "Administrators" -Member "svc_backup"

# Domain account
New-ADUser -Name "helpdesk2" -AccountPassword (ConvertTo-SecureString "P@ss!" -AsPlainText -Force) -Enabled $true
Add-ADGroupMember -Identity "Domain Admins" -Members "helpdesk2"
```

### WMI
```cmd
wmic useraccount where "name='Administrator'" get name,sid
wmic useraccount create name="svc_test",password="Pass!",domain="."
```

### LDAP / DSAdd (Domain)
```cmd
dsadd user "CN=attacker,CN=Users,DC=domain,DC=com" -pwd P@ssw0rd -memberof "CN=Domain Admins,CN=Users,DC=domain,DC=com"
```

---

## Key Windows Event IDs

| Event ID | Description | Key Fields |
|----------|-------------|------------|
| **4720** | User account created | SubjectUserName (who created), TargetUserName (new account) |
| **4722** | User account enabled | |
| **4723** | User changed own password | |
| **4724** | Admin reset password | |
| **4725** | User account disabled | |
| **4726** | User account deleted | |
| **4728** | Member added to global security group | |
| **4732** | Member added to local security group | MemberName, TargetUserName (group) |
| **4738** | User account changed | Changed attributes |
| **4756** | Member added to universal security group | |
| **4688** | Process creation | net.exe, powershell.exe, wmic.exe |

---

## Suspicious Indicators

### Account Naming Red Flags
- Names mimicking service accounts: `svc_`, `backup_`, `admin_`
- Names similar to legitimate users with subtle difference: `j0hn` vs `john`
- Random/gibberish names: `xkZ91a`
- Names with special characters or unicode lookalikes

### Behavioral Red Flags
- Account created outside business hours
- Account created by a non-IT user
- Account immediately added to privileged group
- Account created and used within minutes
- Account created from unusual source machine (workstation, not DC)
- Multiple accounts created in short timeframe

### Process Red Flags
- `net.exe` or `net1.exe` with `user /add`
- `powershell.exe` with `New-LocalUser` or `New-ADUser`
- `wmic.exe` creating accounts
- Parent process: cmd.exe, powershell.exe → net.exe chain from malicious parent

---

## IR Investigation Checklist

1. **Who created the account?** (SubjectUserName in Event 4720)
2. **From which machine?** (ComputerName / WorkstationName)
3. **What time?** (Correlate with business hours)
4. **Was it added to privileged groups?** (Event 4732/4728)
5. **Was the account used?** (Event 4624 — logon events)
6. **How was it created?** (Process creation Event 4688)
7. **Is there persistence?** (Scheduled tasks, Run keys)
8. **What happened after?** (Lateral movement, data access)

---

## Common Exam Questions

- "What is the name of the maliciously created account?"
- "Who (which user) created the account?"
- "What command was used to create the account?"
- "What group was the account added to?"
- "At what time was the account created?"
- "From which host was the account created?"
- "Was the account used after creation? When?"
- "What Event ID corresponds to account creation?"
