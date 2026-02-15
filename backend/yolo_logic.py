import cv2
import numpy as np
from ultralytics import YOLO

class YoloPPEDetector:
    def __init__(self, model_path="yolov8n.pt"):
        """Initialize the YOLOv8 model for person detection."""
        self.model = YOLO(model_path)
        
        # HSV Color Ranges for PPE (Broad ranges for common gear)
        self.color_ranges = {
            "helmet": [
                # Yellow: Hue 20-40
                {"lower": np.array([20, 80, 80]), "upper": np.array([45, 255, 255])},
                # White: Low saturation, high value
                {"lower": np.array([0, 0, 180]), "upper": np.array([180, 60, 255])}
            ],
            "vest": [
                # Orange: Hue 0-20
                {"lower": np.array([0, 90, 90]), "upper": np.array([20, 255, 255])},
                # Neon Green: Hue 40-80
                {"lower": np.array([35, 90, 90]), "upper": np.array([85, 255, 255])}
            ]
        }

    def _check_region_for_color(self, region_hsv, color_type):
        """Check if any of the target colors exist in the HSV region."""
        if region_hsv is None or region_hsv.size == 0:
            return False
            
        combined_mask = np.zeros(region_hsv.shape[:2], dtype=np.uint8)
        for r in self.color_ranges[color_type]:
            mask = cv2.inRange(region_hsv, r["lower"], r["upper"])
            combined_mask = cv2.bitwise_or(combined_mask, mask)
            
        # If enough pixels (e.g. 5% of region) match the color, consider it detected
        pixel_count = cv2.countNonZero(combined_mask)
        total_pixels = region_hsv.shape[0] * region_hsv.shape[1]
        
        return pixel_count > (total_pixels * 0.03) # 3% threshold

    def detect(self, frame, check_helmet=True, check_vest=True):
        """Detect people and then check for PPE in their ROI."""
        # Lower confidence to 0.15 to detect smaller/further objects
        results = self.model(frame, verbose=False, conf=0.15)[0]
        detections = []
        
        for box in results.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            
            if cls != 0: # Only care about "person" (class 0 in COCO)
                continue
                
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            w, h = x2 - x1, y2 - y1
            
            # Extract basic person crop
            person_crop = frame[y1:y2, x1:x2]
            if person_crop.size == 0: continue
            
            hsv = cv2.cvtColor(person_crop, cv2.COLOR_BGR2HSV)
            
            has_helmet = False
            has_vest = False
            
            # 1. Helmet Check (Top 25% of the person)
            if check_helmet:
                head_h = int(h * 0.25)
                head_roi = hsv[0:head_h, :]
                has_helmet = self._check_region_for_color(head_roi, "helmet")
                
            # 2. Vest Check (Middle 50% of the person)
            if check_vest:
                vest_start = int(h * 0.15)
                vest_end = int(h * 0.70)
                vest_roi = hsv[vest_start:vest_end, :]
                has_vest = self._check_region_for_color(vest_roi, "vest")
                
            # Logic: If both are checked, both must be present for "Compliant"
            compliance = "Compliant"
            if check_helmet and not has_helmet: compliance = "Violation"
            if check_vest and not has_vest: compliance = "Violation"
            
            detections.append({
                "status": compliance,
                "conf": conf,
                "bbox": [x1, y1, w, h],
                "helmet": has_helmet,
                "vest": has_vest
            })
            
        return detections

    def draw_annotations(self, frame, detections):
        for d in detections:
            x, y, w, h = d["bbox"]
            
            # Color
            color = (0, 255, 0) # Green
            if d["status"] == "Violation":
                color = (0, 0, 255) # Red
            
            # Box
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            
            # Label
            label = d["status"]
            # Add details
            details = []
            if not d["helmet"]: details.append("No Helmet")
            if not d["vest"]: details.append("No Vest")
            
            if details:
                label += ": " + ", ".join(details)
                
            # Draw label background
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (x, y - 20), (x + tw, y), color, -1)
            cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
        return frame
