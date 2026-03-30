# Lab 04 — Packet Analysis: Demonstrate Your Skills

## Core Concepts

Packet analysis (network forensics) involves examining captured network traffic to identify malicious activity, data exfiltration, C2 communication, or attack patterns.

**Primary Tool:** Wireshark / tshark
**File Format:** PCAP / PCAPNG

---

## Common Attack Patterns in PCAPs

### 1. Port Scanning
- Sequential SYN packets to multiple ports on same host
- SYN with no SYN-ACK response (closed ports → RST)
- Half-open scans (SYN only, never completes handshake)
- UDP probes to common service ports

### 2. Cleartext Credential Theft
- HTTP Basic Auth (Base64 in Authorization header)
- FTP USER/PASS in plaintext
- Telnet credentials
- SMTP AUTH plaintext

### 3. C2 Communication
- Regular beaconing (periodic HTTP/HTTPS requests)
- DNS tunneling (long TXT/NULL records, high-frequency queries)
- ICMP tunneling (data in ICMP payload)
- HTTP with custom User-Agent strings

### 4. Data Exfiltration
- Large HTTP POST to external IP
- FTP upload to external server
- DNS exfiltration (data encoded in subdomains)
- SMTP with attachments to external address

### 5. Malware Downloads
- HTTP GET for .exe/.dll/.ps1 files
- ZIP/RAR downloads from suspicious domains
- PowerShell download cradle patterns

### 6. Lateral Movement
- SMB traffic to multiple internal hosts (\\host\C$)
- RDP (port 3389) connections between internal hosts
- WinRM (port 5985/5986)
- Pass-the-Hash (NTLM auth sequences)

---

## Protocol Quick Reference

| Protocol | Port | What to Look For |
|----------|------|-----------------|
| HTTP | 80 | Cleartext creds, C2, downloads, POST exfil |
| HTTPS | 443 | Certificate anomalies, JA3 fingerprints |
| DNS | 53 | Tunneling, DGA domains, long queries |
| FTP | 21 | Cleartext USER/PASS, file uploads |
| SMB | 445 | Lateral movement, share enumeration |
| RDP | 3389 | Lateral movement |
| ICMP | — | Tunneling, ping sweeps |
| IRC | 6667 | Old-style botnet C2 |
| Telnet | 23 | Cleartext creds |
| SMTP | 25 | Exfiltration via email |

---

## Key Indicators by Attack Stage

### Reconnaissance
- ICMP ping sweeps (ICMP echo to subnet range)
- ARP who-has broadcasts (local subnet scan)
- SYN scans to multiple ports
- Service version probes (banner grabbing)

### Initial Access / Delivery
- HTTP/HTTPS download of executable
- Email with attachment (SMTP traffic)
- Exploit traffic (malformed packets, buffer overflows)

### C2
- Periodic HTTP requests to same IP (beaconing)
- DNS requests to DGA-generated domains (random-looking names)
- HTTPS to IP (not hostname) — no SNI or self-signed cert
- IRC channel joins

### Exfiltration
- Large outbound POST requests
- DNS TXT queries with long encoded strings
- ICMP with non-standard payload size
- FTP STOR commands

---

## Wireshark Display Filters Cheatsheet

### Basic Filters
```wireshark
ip.addr == 192.168.1.100          # Traffic to/from IP
ip.src == 10.0.0.5                # Source IP
ip.dst == 8.8.8.8                 # Destination IP
tcp.port == 80                    # TCP port
udp.port == 53                    # UDP port
not arp and not icmp              # Exclude noise
```

### Protocol Filters
```wireshark
http                              # All HTTP
http.request                      # HTTP requests only
http.response                     # HTTP responses only
http.request.method == "POST"     # POST requests
http.request.uri contains ".exe"  # Executable downloads
ftp                               # All FTP
ftp.request.command == "USER"     # FTP username
ftp-data                          # FTP data transfers
dns                               # All DNS
dns.qry.name contains "pastebin"  # DNS to specific domain
smb                               # SMB traffic
smb2                              # SMB2 traffic
icmp                              # ICMP traffic
telnet                            # Telnet traffic
```

### Suspicious Traffic Filters
```wireshark
# Port scans (SYN only, no data)
tcp.flags.syn == 1 and tcp.flags.ack == 0

# Failed connections (RST)
tcp.flags.reset == 1

# Large packets (possible exfil)
frame.len > 1400

# HTTP with non-standard user agent
http.user_agent contains "python" or http.user_agent contains "curl"

# ICMP with data (possible tunneling)
icmp and data.len > 100

# DNS with long query (possible tunneling)
dns and dns.qry.name.len > 50

# HTTPS to IP (no SNI)
ssl.handshake.extensions_server_name
tls.handshake.type == 1 and !(tls.handshake.extensions_server_name)
```

---

## tshark Command Line

```bash
# Read pcap and show all packets
tshark -r capture.pcap

# Show only HTTP requests
tshark -r capture.pcap -Y "http.request" -T fields -e ip.src -e http.host -e http.request.uri

# Extract HTTP file transfers
tshark -r capture.pcap --export-objects http,./output/

# Show DNS queries
tshark -r capture.pcap -Y "dns.flags.response == 0" -T fields -e ip.src -e dns.qry.name

# Show all unique destination IPs
tshark -r capture.pcap -T fields -e ip.dst | sort -u

# Show TCP streams (conversation)
tshark -r capture.pcap -z conv,tcp

# Follow TCP stream
tshark -r capture.pcap -q -z follow,tcp,ascii,0

# Extract credentials from FTP
tshark -r capture.pcap -Y "ftp.request.command == USER or ftp.request.command == PASS" -T fields -e ftp.request.command -e ftp.request.arg

# Show ICMP with payload
tshark -r capture.pcap -Y "icmp" -T fields -e ip.src -e ip.dst -e data
```

---

## Analysis Workflow

1. **Open PCAP** → Statistics → Capture File Properties (overview)
2. **Statistics → Protocol Hierarchy** — see what protocols are present
3. **Statistics → Conversations** — identify top talkers
4. **Statistics → Endpoints** — identify unique IPs
5. **Statistics → DNS** — look for unusual domains
6. **Filter by suspicious protocol** (HTTP, FTP, ICMP)
7. **Follow TCP/UDP streams** — read full conversations
8. **Export objects** — extract files transferred
9. **Look for credentials** in cleartext protocols
10. **Identify C2 pattern** — beaconing, tunneling

---

## Common Exam Questions

- "What is the attacker's IP address?"
- "What protocol was used for C2/exfiltration?"
- "What credentials were captured?"
- "What file was downloaded/uploaded?"
- "What port was used for the attack?"
- "What domain did the malware communicate with?"
- "What scanning technique was used?"
- "How many hosts were scanned?"
- "What was the first malicious packet?"
