#!/bin/bash
# SOC Lab helper — sourced by /etc/bash.bashrc

# ── Welcome banner ────────────────────────────────────────────────────────────
cat << 'BANNER'

╔══════════════════════════════════════════════════════════════════╗
║     NEXUS FINANCIAL CORP — Linux Server Forensics Lab            ║
║     Host: NFC-SRV-WEB1  |  Ubuntu 22.04 LTS                     ║
╚══════════════════════════════════════════════════════════════════╝
BANNER

echo -e "\e[33m  INCIDENT ALERT — HIGH SEVERITY\e[0m"
echo ""
echo "  Host     : NFC-SRV-WEB1 (Production Web Server)"
echo "  Date     : 2024-11-19  10:03 UTC"
echo "  Alert    : Unusual outbound connections + CRON activity detected"
echo "  Severity : CRITICAL — possible server compromise"
echo ""
echo -e "\e[36m  YOUR MISSION:\e[0m"
echo "  1. Identify the attack vector (how attacker got in)"
echo "  2. Find all dropped malware and persistence mechanisms"
echo "  3. Determine what data was exfiltrated"
echo "  4. Decode the attacker payload to capture the flag"
echo ""
echo -e "\e[90m  ── KEY INVESTIGATION PATHS ──────────────────────────────────────\e[0m"
echo -e "\e[90m  /var/log/auth.log          SSH auth logs\e[0m"
echo -e "\e[90m  /var/log/syslog            System events\e[0m"
echo -e "\e[90m  /home/webadmin/            Compromised user home dir\e[0m"
echo -e "\e[90m  /var/spool/cron/crontabs/  Scheduled jobs\e[0m"
echo -e "\e[90m  /var/www/html/             Web root\e[0m"
echo -e "\e[90m  /root/.ssh/                SSH keys\e[0m"
echo -e "\e[90m  /tmp/                      Temp files\e[0m"
echo ""
echo -e "\e[32m  COMMANDS: show_hints [1-5]  |  check_flag 'NFCSOC{...}'\e[0m"
echo ""

# ── Flag checker ──────────────────────────────────────────────────────────────
check_flag() {
    local FLAG="NFCSOC{l1nux_srv_c0mpr0m1s3d}"
    if [ -z "$1" ]; then
        echo "  Usage: check_flag 'NFCSOC{...}'"
        return 1
    fi
    if [ "$1" = "$FLAG" ]; then
        echo ""
        echo -e "\e[32m╔══════════════════════════════════════════════════════════════╗\e[0m"
        echo -e "\e[32m║                                                              ║\e[0m"
        echo -e "\e[32m║   FLAG CORRECT!  SCENARIO COMPLETE                          ║\e[0m"
        echo -e "\e[33m║   $FLAG              ║\e[0m"
        echo -e "\e[32m║                                                              ║\e[0m"
        echo -e "\e[32m╚══════════════════════════════════════════════════════════════╝\e[0m"
        echo ""
        echo "  ATTACK CHAIN SUMMARY:"
        echo "  ─────────────────────────────────────────────────────────────"
        echo "  09:58  SSH brute-force from 185.220.101.45 (~27 attempts)"
        echo "  10:03  Successful login: webadmin (weak password: Password1!)"
        echo "  10:07  Privilege escalation via sudo NOPASSWD misconfiguration"
        echo "  10:08  Dropper wget'd to /tmp/.X11-unix/.cache and executed"
        echo "  10:08  Crontab persistence: every 5 min re-runs the dropper"
        echo "  10:08  Web shell dropped: /var/www/html/uploads/img001.php"
        echo "  10:08  /etc/shadow exfiltrated via curl POST to 45.33.32.156"
        echo "  10:08  SSH public key added to /root/.ssh/authorized_keys"
        echo ""
        echo "  MITRE ATT&CK:"
        echo "    T1110.001  Brute Force: Password Guessing"
        echo "    T1078      Valid Accounts (webadmin)"
        echo "    T1548.003  Sudo and Sudo Caching (privilege escalation)"
        echo "    T1059.004  Unix Shell"
        echo "    T1105      Ingress Tool Transfer (wget dropper)"
        echo "    T1053.003  Cron (persistence)"
        echo "    T1505.003  Web Shell (persistence)"
        echo "    T1098.004  SSH Authorized Keys (persistence)"
        echo "    T1003.008  /etc/shadow (credential access)"
        echo "    T1041      Exfiltration Over C2"
        echo ""
    else
        echo -e "\e[31m  [!] Incorrect flag.\e[0m"
        echo "      Hint: find the hidden payload in /tmp/.X11-unix/ and decode it"
        echo "      Try:  strings /tmp/.X11-unix/.cache | grep NFCSOC"
        echo "       or:  grep -a PAYLOAD /tmp/.X11-unix/.cache | base64 -d 2>/dev/null"
    fi
}
export -f check_flag

# ── Hints ─────────────────────────────────────────────────────────────────────
show_hints() {
    case "$1" in
        1)
            echo ""
            echo -e "\e[33m── Hint 1: How did the attacker get in? ──\e[0m"
            echo "  Check SSH auth logs for failed and successful logins:"
            echo "    grep 'Failed\|Accepted' /var/log/auth.log"
            echo "  What IP had many failed attempts before a successful login?"
            echo ""
            ;;
        2)
            echo ""
            echo -e "\e[33m── Hint 2: What did the attacker do? ──\e[0m"
            echo "  Check the bash history of the compromised account:"
            echo "    cat /home/webadmin/.bash_history"
            echo "  You'll see the full attack sequence including file downloads,"
            echo "  crontab modification, and web shell creation."
            echo ""
            ;;
        3)
            echo ""
            echo -e "\e[33m── Hint 3: Finding persistence ──\e[0m"
            echo "  Two persistence mechanisms were planted:"
            echo "  1. Cron job:   cat /var/spool/cron/crontabs/webadmin"
            echo "  2. SSH key:    cat /root/.ssh/authorized_keys"
            echo "  3. Web shell:  find /var/www -name '*.php' 2>/dev/null"
            echo "     Then:       grep -r 'shell_exec\|system\|passthru' /var/www/"
            echo ""
            ;;
        4)
            echo ""
            echo -e "\e[33m── Hint 4: Finding the malware binary ──\e[0m"
            echo "  The dropper was hidden using a dot-file in a disguised directory:"
            echo "    find /tmp -name '.*' -type f 2>/dev/null"
            echo "    ls -la /tmp/.X11-unix/"
            echo "  The binary has an ELF header but also contains embedded data."
            echo "  Use: strings /tmp/.X11-unix/.cache"
            echo "  Look for lines between ## PAYLOAD_DATA_START ## and ## PAYLOAD_DATA_END ##"
            echo ""
            ;;
        5)
            echo ""
            echo -e "\e[33m── Hint 5: Decoding the flag ──\e[0m"
            echo "  Extract the base64 payload from the binary:"
            echo "    grep -a 'PAYLOAD_DATA_START' -A2 /tmp/.X11-unix/.cache | tail -1 | base64 -d"
            echo "  Or more directly:"
            echo "    strings /tmp/.X11-unix/.cache | grep 'TkZD' | base64 -d"
            echo "  The decoded value is the flag. Then:"
            echo "    check_flag 'NFCSOC{...}'"
            echo ""
            ;;
        *)
            echo ""
            echo "  Usage: show_hints <1-5>"
            echo "  Hints go from vague (1) to exact answer (5)."
            echo ""
            ;;
    esac
}
export -f show_hints
