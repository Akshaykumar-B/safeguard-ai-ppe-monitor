import sqlite3
import json
import os
from pathlib import Path

# Fix DB Path to backend/safeguard.db
db_path = Path(__file__).parent / "safeguard.db"
video_path = r"c:\Users\aksha\Downloads\open cv project\upstairs-Cam 03.mp4"

if not os.path.exists(video_path):
    print(f"Error: Video file not found at {video_path}")
    exit(1)

conn = sqlite3.connect(str(db_path))
c = conn.cursor()

# Get current settings
c.execute("SELECT value FROM settings WHERE key='app_config'")
row = c.fetchone()
if row:
    settings = json.loads(row[0])
else:
    settings = {}

# Update settings
settings["cameraSource"] = "rtsp"
settings["rtspUrl"] = video_path

# Save
c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", 
          ('app_config', json.dumps(settings)))
conn.commit()
conn.close()

print(f"Updated default camera to: {video_path}")
