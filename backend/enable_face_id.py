import sqlite3
import json

db_path = "safeguard.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get settings
c.execute("SELECT value FROM settings WHERE key='app_config'")
row = c.fetchone()
if row:
    settings = json.loads(row[0])
    
    if "detectionTargets" not in settings:
        settings["detectionTargets"] = {}
        
    # Enable EVERYTHING for demo
    settings["detectionTargets"]["face_id"] = True
    settings["detectionTargets"]["helmet"] = True
    settings["detectionTargets"]["vest"] = True
    # Maybe others?
    # settings["detectionTargets"]["mask"] = False # Keep simple
    
    # Save back
    c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", 
              ('app_config', json.dumps(settings)))
    conn.commit()
    print("Enabled Face ID Simulation and ensured Detection Targets are active.")
else:
    print("No settings found to update.")

conn.close()
