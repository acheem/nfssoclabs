# Lab 04 — Packet Analysis: Filters & Commands

## Wireshark Display Filters

### Step 1: Get the Big Picture
```wireshark
# Remove noise, see real traffic
not arp and not icmp and not mdns and not ssdp

# Top conversations — use Statistics > Conversations menu
# Top protocols — use Statistics > Protocol Hierarchy menu
```

### Reconnaissance Detection
```wireshark
# Port scan (SYN without ACK)
tcp.flags.syn == 1 and tcp.flags.ack == 0

# RST responses (closed ports)
tcp.flags.reset == 1

# ICMP sweep
icmp.type == 8

# UDP probe
udp and frame.len < 100
```

### Credential Harvesting
```wireshark
# HTTP Basic Auth
http.authorization

# FTP credentials
ftp.request.command == "USER" or ftp.request.command == "PASS"

# Telnet (everything is cleartext)
telnet

# HTTP POST (form submission with possible creds)
http.request.method == "POST"

# NTLM auth in SMB
ntlmssp
```

### Malware Download
```wireshark
# Executable download
http.request.uri contains ".exe" or http.request.uri contains ".dll"
http.request.uri contains ".ps1" or http.request.uri contains ".vbs"
http.request.uri contains ".zip" or http.request.uri contains ".rar"

# HTTP GET from suspicious path
http.request.method == "GET" and http.request.uri contains "/gate"
http.request.method == "GET" and http.request.uri contains "/upload"
```

### C2 Communication
```wireshark
# Beaconing — use Statistics > HTTP > Requests to spot patterns

# Non-standard User-Agent
http.user_agent contains "python"
http.user_agent contains "curl"
http.user_agent contains "WinHttp"
http.user_agent contains "Go-http-client"

# HTTP to IP (no domain — suspicious)
http and not http.host matches "[a-zA-Z]"

# HTTPS to IP without SNI
tls.handshake.type == 1

# IRC C2
tcp.port == 6667

# Cobalt Strike default ports
tcp.port == 50050 or tcp.port == 4444
```

### DNS Tunneling
```wireshark
# Long DNS queries (data encoded in subdomain)
dns and dns.qry.name.len > 50

# High-frequency DNS to same domain
dns.flags.response == 0

# TXT record responses (often used in DNS tunneling)
dns.resp.type == 16

# NULL record queries
dns.qry.type == 10
```

### Data Exfiltration
```wireshark
# Large POST
http.request.method == "POST" and frame.len > 1000

# FTP file upload
ftp.request.command == "STOR"

# SMTP with attachment (email exfil)
smtp

# ICMP tunneling (large payload)
icmp and data.len > 64
```

---

## tshark Commands

### Reconnaissance
```bash
# See all unique source/dest pairs
tshark -r capture.pcap -T fields -e ip.src -e ip.dst | sort | uniq -c | sort -rn | head 20

# SYN scan pattern
tshark -r capture.pcap -Y "tcp.flags.syn==1 and tcp.flags.ack==0" \
  -T fields -e ip.src -e ip.dst -e tcp.dstport | sort -u

# Count unique destination ports per source (port scan indicator)
tshark -r capture.pcap -T fields -e ip.src -e tcp.dstport \
  | sort | uniq -c | sort -rn | head 20
```

### Credential Extraction
```bash
# FTP credentials
tshark -r capture.pcap -Y "ftp" \
  -T fields -e ip.src -e ip.dst -e ftp.request.command -e ftp.request.arg

# HTTP auth headers
tshark -r capture.pcap -Y "http.authorization" \
  -T fields -e ip.src -e http.host -e http.authorization

# Follow stream to read full conversation
tshark -r capture.pcap -q -z follow,tcp,ascii,STREAM_NUMBER
# (get stream number from Wireshark — right-click > Follow > TCP Stream)
```

### File Extraction
```bash
# Extract all HTTP objects (files)
tshark -r capture.pcap --export-objects http,./extracted_files/

# Extract SMB files
tshark -r capture.pcap --export-objects smb,./extracted_files/

# Extract FTP files
tshark -r capture.pcap --export-objects ftp-data,./extracted_files/

# Get hashes of extracted files
md5sum ./extracted_files/*
sha256sum ./extracted_files/*
```

### DNS Analysis
```bash
# All DNS queries
tshark -r capture.pcap -Y "dns.flags.response==0" \
  -T fields -e _ws.col.Time -e ip.src -e dns.qry.name | sort

# DNS query lengths (detect tunneling)
tshark -r capture.pcap -Y "dns" \
  -T fields -e dns.qry.name | awk '{print length, $0}' | sort -rn | head 20

# Unique domains queried
tshark -r capture.pcap -Y "dns.flags.response==0" \
  -T fields -e dns.qry.name | sort -u
```

### C2 / Beaconing
```bash
# HTTP requests with timing (spot regular intervals)
tshark -r capture.pcap -Y "http.request" \
  -T fields -e _ws.col.Time -e ip.src -e ip.dst -e http.host -e http.request.uri \
  | sort -k3

# All HTTP hosts contacted
tshark -r capture.pcap -Y "http.request" \
  -T fields -e http.host | sort | uniq -c | sort -rn

# HTTPS SNI names
tshark -r capture.pcap -Y "tls.handshake.type==1" \
  -T fields -e ip.dst -e tls.handshake.extensions_server_name | sort -u
```

### Exfiltration
```bash
# Large HTTP POST
tshark -r capture.pcap -Y "http.request.method==POST" \
  -T fields -e ip.src -e ip.dst -e http.host -e http.request.uri -e http.content_length

# All outbound data volume by destination
tshark -r capture.pcap -q -z conv,tcp | sort -k9 -rn | head 20
```

---

## NetworkMiner / Automated Tools

```bash
# NetworkMiner (GUI) — opens PCAP, auto-extracts files, credentials, sessions
# Key tabs: Hosts, Files, Credentials, Sessions, DNS

# Zeek/Bro analysis
zeek -r capture.pcap
cat conn.log | zeek-cut id.orig_h id.resp_h id.resp_p proto service bytes | sort -k6 -rn | head 20
cat http.log | zeek-cut ts id.orig_h id.resp_h uri method host
cat dns.log | zeek-cut ts query qtype_name answers
```

---

## Quick Decode Tricks

```bash
# Decode base64 string found in traffic
echo "BASE64STRING==" | base64 -d

# URL decode
python3 -c "import urllib.parse; print(urllib.parse.unquote('URL_ENCODED_STRING'))"

# XOR decode (if key is known)
python3 -c "
data = bytes.fromhex('HEXSTRING')
key = 0x41
print(''.join(chr(b ^ key) for b in data))
"

# Extract readable strings from binary blob
strings extracted_file.exe | grep -E "(http|ftp|smtp|\.exe|cmd|powershell)"
```
