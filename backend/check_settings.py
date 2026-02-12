import sqlite3
import json

conn = sqlite3.connect('safeguard.db')
c = conn.cursor()
c.execute("SELECT value FROM settings WHERE key='app_config'")
row = c.fetchone()
if row:
    settings = json.loads(row[0])
    print(json.dumps(settings, indent=2))
else:
    print("No settings found.")
conn.close()
