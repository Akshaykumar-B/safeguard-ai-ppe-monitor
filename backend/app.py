import os
import cv2
import time
import json
import sqlite3
import threading
from datetime import datetime
from flask import Flask, request, jsonify, g, send_from_directory, Response
from flask_cors import CORS

from yolo_logic import YoloPPEDetector
from firebase_auth import require_auth, require_role, init_firebase
from video_processor import VideoProcessor

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

# Warm up the model once on the main thread to prevent threading conflicts
import numpy as np
_dummy = np.zeros((64, 64, 3), dtype=np.uint8)
detector.detect(_dummy)
print("YOLO model warmed up successfully.")

# Global lock so only one thread runs YOLO at a time
detection_lock = threading.Lock()

# --- Video Processors ---
CAMERAS = {
    "cam01": r"c:\Users\aksha\Downloads\open cv project\Assembly Line A-Cam 01.mp4",
    "cam02": r"c:\Users\aksha\Downloads\open cv project\Dock Area-Cam 02.mp4",
    "cam03": r"c:\Users\aksha\Downloads\open cv project\upstairs-Cam 03.mp4"
}

processors = {}

# Start processors with a small delay between each to avoid race conditions
import time as _time
for cam_id, path in CAMERAS.items():
    if os.path.exists(path):
        print(f"Starting processor for {cam_id}...")
        p = VideoProcessor(path, cam_id, DB_PATH, SNAPSHOT_FOLDER)
        p.start(detector, detection_lock)
        processors[cam_id] = p
        _time.sleep(1)  # Stagger startup
    else:
        print(f"Warning: Video file not found: {path}")

# --- DB Helpers ---
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute("PRAGMA journal_mode=WAL")
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
    # Get latest metric for EACH camera
    rows = db.execute("""
        SELECT camera_id, total_tracked, active_violations, compliance_rate, fps 
        FROM metrics_log 
        WHERE id IN (
            SELECT MAX(id) 
            FROM metrics_log 
            GROUP BY camera_id
        )
    """).fetchall()
    db.close()
    
    if not rows:
        return jsonify({
            "total_tracked": 0,
            "active_violations": 0,
            "compliance_rate": 100.0,
            "fps": 0.0
        })

    total_tracked = sum(r["total_tracked"] for r in rows)
    total_violations = sum(r["active_violations"] for r in rows)
    avg_fps = sum(r["fps"] for r in rows) / len(rows) if rows else 0
    
    compliance_rate = 100.0
    if total_tracked > 0:
        compliance_rate = ((total_tracked - total_violations) / total_tracked) * 100.0
        
    return jsonify({
        "total_tracked": total_tracked,
        "active_violations": total_violations,
        "compliance_rate": round(compliance_rate, 1),
        "fps": round(avg_fps, 1)
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

@app.route('/snapshots/<path:filename>')
def serve_snapshot(filename):
    return send_from_directory(SNAPSHOT_FOLDER, filename)

@app.route('/video_feed/<cam_id>')
def video_feed(cam_id):
    if cam_id not in processors:
        return jsonify({"error": "Camera not found or inactive"}), 404
        
    def generate():
        processor = processors[cam_id]
        while True:
            frame = processor.get_frame()
            if frame is None:
                time.sleep(0.01)
                continue
                
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

# --- Background Processing Simulation ---
# In a real app, this would process the camera stream.
# Here we simulate real-time metrics for the dashboard.
def background_metrics_updater():
    while True:
        try:
            db = get_db()
            # Randomly fluctuate metrics slightly for a "live" feel
            
            for cam_id in ["cam01", "cam02", "cam03"]:
                proc = processors.get(cam_id)
                if proc:
                    stats = proc.get_stats()
                    
                    db.execute(
                        "INSERT INTO metrics_log (camera_id, total_tracked, active_violations, compliance_rate, fps) VALUES (?, ?, ?, ?, ?)",
                        (cam_id, stats["total_tracked"], stats["active_violations"], stats["compliance_rate"], stats["fps"])
                    )

            # Keep log small
            db.execute("DELETE FROM metrics_log WHERE id NOT IN (SELECT id FROM metrics_log ORDER BY created_at DESC LIMIT 50)")
            
            # --- Cleanup Old Snapshots (Keep Max 10) ---
            # Get IDs of old violations
            old_violations = db.execute("SELECT id, snapshot FROM violations WHERE id NOT IN (SELECT id FROM violations ORDER BY created_at DESC LIMIT 10)").fetchall()
            
            if old_violations:
                # Delete files
                for vio in old_violations:
                    try:
                        # Extract filename from URL (e.g. http://localhost:5000/snapshots/vio_cam01_123.jpg)
                        if vio["snapshot"] and "/snapshots/" in vio["snapshot"]:
                            filename = vio["snapshot"].split("/snapshots/")[-1]
                            filepath = os.path.join(SNAPSHOT_FOLDER, filename)
                            if os.path.exists(filepath):
                                os.remove(filepath)
                                print(f"Deleted old snapshot: {filename}")
                    except Exception as err:
                        print(f"Error deleting snapshot file: {err}")
                
                # Delete DB rows
                db.execute("DELETE FROM violations WHERE id NOT IN (SELECT id FROM violations ORDER BY created_at DESC LIMIT 10)")
                print(f"Cleaned up {len(old_violations)} old violations")

            db.commit()
            db.close()
        except Exception as e:
            print(f"Metrics Thread Error: {e}")
        time.sleep(2)

threading.Thread(target=background_metrics_updater, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
