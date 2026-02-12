import os
import cv2
import time
import json
import sqlite3
import threading
from datetime import datetime
from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS

from yolo_logic import YoloPPEDetector
from firebase_auth import require_auth, require_role, init_firebase

# --- Initialize ---
app = Flask(__name__)
CORS(app)
init_firebase()

DB_PATH = os.path.join(os.path.dirname(__file__), "safeguard.db")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
SNAPSHOT_FOLDER = os.path.join(os.path.dirname(__file__), "snapshots")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SNAPSHOT_FOLDER, exist_ok=True)

detector = YoloPPEDetector(os.path.join(os.path.dirname(__file__), "yolov8n.pt"))

# --- DB Helpers ---
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- API Endpoints ---

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "SafeGuard AI Backend",
        "opencv_version": cv2.__version__
    })

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    db = get_db()
    row = db.execute("SELECT * FROM metrics_log ORDER BY created_at DESC LIMIT 1").fetchone()
    db.close()
    if row:
        return jsonify(dict(row))
    return jsonify({
        "total_tracked": 0,
        "active_violations": 0,
        "compliance_rate": 100.0,
        "fps": 0.0
    })

@app.route("/api/workers", methods=["GET"])
def get_workers():
    db = get_db()
    rows = db.execute("SELECT * FROM workers ORDER BY created_at DESC").fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/workers", methods=["POST"])
@require_auth
@require_role("admin")
def add_worker():
    data = request.json
    db = get_db()
    worker_id = data.get("id") or f"WRK-{int(time.time() % 10000)}"
    db.execute(
        "INSERT INTO workers (id, name, role, site, compliance, last_seen, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (worker_id, data.get("name"), data.get("role"), data.get("site", "Refinery Alpha"), "Compliant", "Just now", data.get("img", ""))
    )
    db.commit()
    db.close()
    return jsonify({"success": True, "id": worker_id})

@app.route("/api/workers/<id>", methods=["DELETE"])
@require_auth
@require_role("admin")
def delete_worker(id):
    db = get_db()
    db.execute("DELETE FROM workers WHERE id = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"success": True})

@app.route("/api/violations", methods=["GET"])
def get_violations():
    db = get_db()
    rows = db.execute("SELECT * FROM violations ORDER BY created_at DESC LIMIT 50").fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/violations/<id>", methods=["PUT"])
@require_auth
@require_role("admin", "staff")
def update_violation(id, status=None):
    data = request.json
    status = data.get("status")
    db = get_db()
    db.execute("UPDATE violations SET status = ? WHERE id = ?", (status, id))
    db.commit()
    db.close()
    return jsonify({"success": True})

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    db = get_db()
    rows = db.execute("SELECT * FROM alerts WHERE read = 0 ORDER BY created_at DESC").fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/alerts/<int:id>/read", methods=["PUT"])
def mark_alert_read(id):
    db = get_db()
    db.execute("UPDATE alerts SET read = 1 WHERE id = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"success": True})

@app.route("/api/alerts/<int:id>", methods=["DELETE"])
def dismiss_alert(id):
    db = get_db()
    db.execute("DELETE FROM alerts WHERE id = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"success": True})

@app.route("/api/settings", methods=["GET"])
def get_settings():
    db = get_db()
    row = db.execute("SELECT value FROM settings WHERE key='app_config'").fetchone()
    db.close()
    if row:
        return jsonify(json.loads(row[0]))
    return jsonify({})

@app.route("/api/settings", methods=["PUT"])
@require_auth
@require_role("admin")
def save_settings():
    data = request.json
    db = get_db()
    db.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('app_config', ?)", (json.dumps(data),))
    db.commit()
    db.close()
    return jsonify({"success": True})

@app.route("/api/detect", methods=["POST"])
def detect_ppe():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files["image"]
    filename = f"detect_{int(time.time())}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    img = cv2.imread(filepath)
    detections = detector.detect(img)
    
    compliance = "Compliant"
    violations_count = sum(1 for d in detections if d["status"] == "Violation")
    if violations_count > 0:
        compliance = "Violation"
        
    return jsonify({
        "compliance_status": compliance,
        "detections": detections,
        "total_persons": len(detections)
    })

# --- Background Processing Simulation ---
# In a real app, this would process the camera stream.
# Here we simulate real-time metrics for the dashboard.
def background_metrics_updater():
    while True:
        try:
            db = get_db()
            # Randomly fluctuate metrics slightly for a "live" feel
            total = 10 + int(time.time() % 3)
            violations = int(time.time() % 2)
            rate = 100.0 if violations == 0 else 92.5
            fps = 15.0 + (time.time() % 1)
            
            db.execute(
                "INSERT INTO metrics_log (camera_id, total_tracked, active_violations, compliance_rate, fps) VALUES ('cam01', ?, ?, ?, ?)",
                (total, violations, rate, fps)
            )
            # Keep log small
            db.execute("DELETE FROM metrics_log WHERE id NOT IN (SELECT id FROM metrics_log ORDER BY created_at DESC LIMIT 10)")
            db.commit()
            db.close()
        except Exception as e:
            print(f"Metrics Thread Error: {e}")
        time.sleep(2)

threading.Thread(target=background_metrics_updater, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
