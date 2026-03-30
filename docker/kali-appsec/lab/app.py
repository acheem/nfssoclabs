"""
Nexus Financial Corp — Internal Employee Portal
Vulnerable web application for AppSec CTF training.

Vulnerabilities:
  /login       — SQL Injection (authentication bypass)
  /user        — IDOR (insecure direct object reference)
  /files       — Path Traversal
  /ping        — Command Injection
  /search      — Reflected XSS
"""

import os, sqlite3, subprocess, html
from flask import Flask, request, jsonify, render_template_string, make_response

app = Flask(__name__)
DB_PATH = "/tmp/nfc_portal.db"

# ── Database setup ─────────────────────────────────────────────────────────────
def get_db():
    return sqlite3.connect(DB_PATH)

def init_db():
    c = get_db()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        department TEXT,
        notes TEXT
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY,
        owner_id INTEGER,
        title TEXT,
        content TEXT
    )""")
    # Normal employees
    c.execute("INSERT OR IGNORE INTO users VALUES (1,'alice.chen','Finance2024!','user','Finance','Annual leave: 12 days remaining')")
    c.execute("INSERT OR IGNORE INTO users VALUES (2,'bob.marsh','Procurement1!','user','Procurement','Pending approvals: 3')")
    c.execute("INSERT OR IGNORE INTO users VALUES (3,'priya.nair','Legal2024#','user','Legal','Review deadline: Nov 25')")
    # Admin account — notes contain Flag 1
    with open('/lab/flags/flag1.txt','r') as f:
        flag1 = f.read().strip()
    c.execute(f"INSERT OR IGNORE INTO users VALUES (4,'admin','Nx!S3cur3_4dm1n_2024','admin','IT Security','{flag1}')")
    # Documents — one per user
    c.execute("INSERT OR IGNORE INTO documents VALUES (1,1,'Q4 Forecast','Revenue projection: $4.2M')")
    c.execute("INSERT OR IGNORE INTO documents VALUES (2,2,'Vendor List','Approved vendors: ...')")
    c.execute("INSERT OR IGNORE INTO documents VALUES (3,3,'Contract Review','NDA expiry: Dec 2025')")
    c.execute("INSERT OR IGNORE INTO documents VALUES (4,4,'Admin Notes','Internal SOC flags: see /lab/flags/')")
    c.commit()
    c.close()

# ── HTML templates ─────────────────────────────────────────────────────────────
HOME_HTML = """<!DOCTYPE html>
<html><head><title>NFC Internal Portal</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:50px auto;padding:20px;background:#1a1a2e;color:#eee}
h1{color:#00d4ff}a{color:#00d4ff}
.endpoint{background:#16213e;padding:15px;margin:10px 0;border-radius:5px;border-left:3px solid #00d4ff}
.method{color:#ff6b6b;font-weight:bold}.path{color:#ffd93d}</style></head>
<body>
<h1>Nexus Financial Corp — Internal Employee Portal</h1>
<p>Welcome to the NFC internal portal. Please authenticate to access resources.</p>
<h2>Available Endpoints</h2>
<div class="endpoint"><span class="method">POST</span> <span class="path">/login</span> — Authenticate (params: username, password)</div>
<div class="endpoint"><span class="method">GET</span>  <span class="path">/user?id=N</span> — View employee profile</div>
<div class="endpoint"><span class="method">GET</span>  <span class="path">/search?q=text</span> — Search employees</div>
<div class="endpoint"><span class="method">GET</span>  <span class="path">/files?path=filename</span> — View documents</div>
<div class="endpoint"><span class="method">GET</span>  <span class="path">/ping?host=IP</span> — Network diagnostic</div>
<div class="endpoint"><span class="method">GET</span>  <span class="path">/api/users</span> — Employee list (authenticated)</div>
<p><small>NFC IT Security Team — For issues contact helpdesk@nexusfinancial.com</small></p>
</body></html>"""

LOGIN_HTML = """<!DOCTYPE html>
<html><head><title>NFC Portal Login</title>
<style>body{font-family:Arial,sans-serif;max-width:400px;margin:100px auto;background:#1a1a2e;color:#eee}
input{width:100%;padding:10px;margin:5px 0;background:#16213e;border:1px solid #00d4ff;color:#eee;border-radius:3px}
button{width:100%;padding:10px;background:#00d4ff;color:#000;border:none;cursor:pointer;border-radius:3px;font-weight:bold}
h2{color:#00d4ff}</style></head>
<body><h2>NFC Portal — Login</h2>
<form method="POST" action="/login">
<input name="username" placeholder="Username"><br>
<input name="password" type="password" placeholder="Password"><br>
<button type="submit">Login</button>
</form></body></html>"""

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template_string(HOME_HTML)

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template_string(LOGIN_HTML)

    username = request.form.get('username','')
    password = request.form.get('password','')

    # !! VULNERABLE: SQL Injection — unsanitised string concatenation
    query = f"SELECT id,username,role,department,notes FROM users WHERE username='{username}' AND password='{password}'"
    try:
        conn = get_db()
        rows = conn.execute(query).fetchall()
        conn.close()
    except Exception as e:
        return jsonify({"error": f"Database error: {e}", "query": query}), 500

    if rows:
        results = []
        for r in rows:
            results.append({
                "id": r[0], "username": r[1], "role": r[2],
                "department": r[3], "notes": r[4]
            })
        return jsonify({"status": "success", "users": results,
                        "message": f"Authenticated as: {rows[0][1]}"})
    return jsonify({"status": "failed", "message": "Invalid credentials"}), 401

@app.route('/user')
def user_profile():
    # !! VULNERABLE: IDOR — no authentication check, any ID accessible
    user_id = request.args.get('id','1')
    try:
        conn = get_db()
        row = conn.execute(
            "SELECT id,username,role,department,notes FROM users WHERE id=?", (user_id,)
        ).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if row:
        return jsonify({
            "id": row[0], "username": row[1], "role": row[2],
            "department": row[3], "notes": row[4]
        })
    return jsonify({"error": "User not found"}), 404

@app.route('/search')
def search():
    q = request.args.get('q','')
    # !! VULNERABLE: Reflected XSS — user input reflected without sanitisation
    if not q:
        return "<p>Usage: /search?q=keyword</p>"
    # Intentionally NOT using html.escape()
    result_html = f"""<html><body>
    <h2>Search results for: {q}</h2>
    <p>No employees found matching your query.</p>
    <a href='/'>Back to portal</a>
    </body></html>"""
    return result_html

@app.route('/files')
def read_file():
    path = request.args.get('path','readme.txt')
    # !! VULNERABLE: Path Traversal — weak prefix check bypassed by nested traversal
    base = '/lab/data/'
    # Naive attempt to block traversal — only strips leading ../
    safe_path = path.lstrip('/')
    full_path = base + safe_path   # No os.path.normpath = traversal works

    try:
        with open(full_path, 'r') as f:
            content = f.read()
        return jsonify({"file": path, "content": content})
    except FileNotFoundError:
        return jsonify({"error": f"File not found: {path}",
                        "hint": "Try common files like readme.txt or ../flags/flag2.txt"}), 404
    except PermissionError:
        return jsonify({"error": "Permission denied"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ping')
def ping():
    host = request.args.get('host','127.0.0.1')
    # !! VULNERABLE: Command Injection — only blocks & and ; but not | or backticks
    blocked = ['&', ';', '\n', '\r']
    for c in blocked:
        if c in host:
            return jsonify({"error": f"Invalid character '{c}' in host"}), 400

    cmd = f"ping -c 2 -W 1 {host}"
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True,
                                text=True, timeout=5)
        output = result.stdout + result.stderr
        return jsonify({"command": f"ping -c 2 {host}", "output": output})
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users')
def api_users():
    # No auth — information disclosure
    conn = get_db()
    rows = conn.execute("SELECT id,username,role,department FROM users").fetchall()
    conn.close()
    return jsonify({"users": [
        {"id": r[0],"username": r[1],"role": r[2],"department": r[3]} for r in rows
    ]})

# ── Start ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    os.makedirs('/lab/data', exist_ok=True)
    with open('/lab/data/readme.txt','w') as f:
        f.write("NFC Internal Portal v2.1\nContents: readme.txt, notice.txt\n")
    with open('/lab/data/notice.txt','w') as f:
        f.write("Security notice: All access is logged.\nContact: security@nexusfinancial.com\n")
    init_db()
    print("[+] NFC Portal running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
