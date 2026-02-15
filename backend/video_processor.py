import cv2
import time
import threading
import sqlite3
import os
import platform
from datetime import datetime
from yolo_logic import YoloPPEDetector

class VideoProcessor:
    def __init__(self, source, camera_id="cam01", db_path="safeguard.db", snapshot_folder="snapshots"):
        self.source = source
        self.camera_id = camera_id
        self.db_path = db_path
        self.snapshot_folder = snapshot_folder
        
        self.running = False
        self.thread = None
        self.lock = threading.Lock()
        self.processed_frame = None
        self.detector = None
        self.detection_lock = None  # Shared lock for YOLO thread safety
        
        # State
        self.last_violation_time = 0
        self.violation_cooldown = 15 # Seconds between logging violations (Increased to prevent spam)
        self.fps = 0
        self.total_tracked = 0
        self.active_violations = 0

        self.compliance_rate = 100.0

    def start(self, detector_ref, detection_lock=None):
        self.detector = detector_ref
        self.detection_lock = detection_lock
        self.running = True
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()
        
    def get_frame(self):
        with self.lock:
            if self.processed_frame is None:
                return None
            return self.processed_frame.copy()

    def get_stats(self):
        with self.lock:
            return {
                "fps": self.fps,
                "total_tracked": self.total_tracked,
                "active_violations": self.active_violations,
                "compliance_rate": self.compliance_rate
            }

    def _log_violation(self, frame, detections):
        try:
            violations = [d for d in detections if d['status'] == 'Violation']
            if not violations: return

            timestamp = int(time.time())
            filename = f"vio_{self.camera_id}_{timestamp}.jpg"
            filepath = os.path.join(self.snapshot_folder, filename)
            
            cv2.imwrite(filepath, frame)
            
            v = violations[0]
            violation_type = "PPE Violation"
            if not v.get('helmet', True): violation_type = "No Helmet"
            elif not v.get('vest', True): violation_type = "No Vest"
            
            now_str = datetime.now()
            date_str = now_str.strftime("%b %d, %Y")
            time_str = now_str.strftime("%H:%M:%S")
            
            conn = sqlite3.connect(self.db_path, timeout=10)
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute(
                """INSERT INTO violations 
                   (id, date, time, worker, worker_id, type, severity, zone, camera_id, status, snapshot) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (f"VIO-{timestamp}-{self.camera_id}", date_str, time_str, "Unknown Worker", "N/A", 
                 violation_type, "High", f"Zone {self.camera_id}", self.camera_id, "Pending", 
                 f"http://localhost:5000/snapshots/{filename}")
            )
            conn.commit()
            conn.close()
            print(f"Logged violation: {filename}")
            
        except Exception as e:
            print(f"Error logging violation: {e}")

    def _process_loop(self):
        print(f"Opening video source: {self.source}")
        cap = cv2.VideoCapture(self.source)
        
        if not cap.isOpened():
            print(f"FAILED to open: {self.source}")
            return

        frame_count = 0
        detect_every = 5  # Run YOLO every 5th frame to share CPU fairly
        last_detections = []
        start_time = time.time()
        
        while self.running:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            
            # Resize ALL videos to 640x360 for fast processing
            frame = cv2.resize(frame, (640, 360))
                
            frame_count += 1
            
            # FPS Calculation
            if frame_count % 30 == 0:
                elapsed = time.time() - start_time
                self.fps = 30 / elapsed if elapsed > 0 else 0
                start_time = time.time()

            # Only run detection every Nth frame
            if frame_count % detect_every == 0:
                try:
                    if self.detection_lock:
                        # Use timeout to prevent starvation
                        acquired = self.detection_lock.acquire(timeout=2)
                        if acquired:
                            try:
                                last_detections = self.detector.detect(frame)
                            finally:
                                self.detection_lock.release()
                    else:
                        last_detections = self.detector.detect(frame)
                except Exception as e:
                    print(f"Detection error in {self.camera_id}: {e}")
                    last_detections = []

            # Always draw the latest known detections on the current frame
            annotated_frame = self.detector.draw_annotations(frame.copy(), last_detections)
            
            # Update stats
            with self.lock:
                self.processed_frame = annotated_frame
                self.total_tracked = len(last_detections)
                violation_count = sum(1 for d in last_detections if d['status'] == 'Violation')
                self.active_violations = violation_count
                if self.total_tracked > 0:
                    self.compliance_rate = ((self.total_tracked - self.active_violations) / self.total_tracked) * 100
                else:
                    self.compliance_rate = 100.0

            # Log Violation if needed
            if self.active_violations > 0:
                if time.time() - self.last_violation_time > self.violation_cooldown:
                    threading.Thread(target=self._log_violation, args=(annotated_frame.copy(), list(last_detections)), daemon=True).start()
                    self.last_violation_time = time.time()
            
            # Throttle to ~15 FPS
            time.sleep(0.06)
            
        cap.release()
