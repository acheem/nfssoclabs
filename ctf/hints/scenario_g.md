# Hints — Scenario G: Linux Server Compromise

> Read one hint at a time. Try to solve it before moving to the next.
> Environment: `docker attach linux-forensics-lab`

---

## Hint G1 — How did the attacker get in?

Check the SSH authentication log for patterns:
```bash
grep 'Failed\|Accepted' /var/log/auth.log | less
```
Count how many `Failed password` entries appear from the same IP before a successful login.
What IP had dozens of failures before an `Accepted password`?

---

## Hint G2 — What did the attacker do after logging in?

Every command the attacker ran was saved to bash history:
```bash
cat /home/webadmin/.bash_history
```
Read it top to bottom — it tells the complete attack story:
privilege escalation → malware download → persistence → exfiltration → backdoor.

---

## Hint G3 — Finding all persistence mechanisms

Three separate backdoors were planted. Check all three:
```bash
# 1. Cron job
cat /var/spool/cron/crontabs/webadmin

# 2. Web shell (dangerous PHP function in web root)
grep -r 'shell_exec\|system\|passthru' /var/www/html/

# 3. SSH key backdoor
cat /root/.ssh/authorized_keys
```
Which of these would survive a password reset?

---

## Hint G4 — Finding the malware binary

The dropper was hidden using a dot-file inside a disguised directory name:
```bash
find /tmp -name '.*' -type f 2>/dev/null
ls -la /tmp/.X11-unix/
```
The `.X11-unix` directory name mimics the legitimate X11 socket directory.
What files are inside it?

---

## Hint G5 — Decoding the flag

The malware binary has an ELF header but contains embedded text data.
Use `strings` to extract readable content:
```bash
strings /tmp/.X11-unix/.cache
```
Look for lines between `## PAYLOAD_DATA_START ##` and `## PAYLOAD_DATA_END ##`.
The content between them is base64 encoded. Decode it:
```bash
strings /tmp/.X11-unix/.cache | grep -A1 'PAYLOAD_DATA_START' | tail -1 | base64 -d
```
That decoded value is your flag.
```bash
check_flag 'NFCSOC{...}'
