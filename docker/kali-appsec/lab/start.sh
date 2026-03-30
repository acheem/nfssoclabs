#!/bin/bash
# Start the vulnerable app in background then open interactive shell

# Source helpers
. /lab/soc_appsec.sh

# Start Flask app in background
python3 /lab/app.py > /tmp/app.log 2>&1 &
APP_PID=$!
sleep 2

# Check app started
if curl -s http://localhost:5000/ > /dev/null 2>&1; then
    echo -e "\e[32m  [+] NFC Portal running at http://localhost:5000\e[0m"
else
    echo -e "\e[31m  [!] App may still be starting — wait a moment then try curl http://localhost:5000/\e[0m"
fi
echo ""

# Drop into interactive shell
exec /bin/bash --login
