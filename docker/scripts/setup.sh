#!/bin/bash
SPLUNK=/opt/splunk/bin/splunk
PASS="AABVINLABS1!"

echo "[*] Waiting for Splunk to be ready..."
until curl -s http://localhost:8000 > /dev/null 2>&1; do sleep 5; done
sleep 10

echo "[*] Creating indexes..."
$SPLUNK add index lab02 -auth admin:$PASS 2>/dev/null || true
$SPLUNK add index lab03 -auth admin:$PASS 2>/dev/null || true

echo "[*] Copying inputs.conf..."
cp /tmp/configs/inputs.conf /opt/splunk/etc/system/local/inputs.conf

echo "[*] Restarting Splunk to pick up config..."
$SPLUNK restart -auth admin:$PASS 2>/dev/null

echo "[+] Done. http://localhost:8000  admin / AABVINLABS1!"
