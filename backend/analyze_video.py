import cv2
from yolo_logic import YoloPPEDetector

# Initialize Detector
detector = YoloPPEDetector("yolov8n.pt")
print("✅ Detector initialized")

# Path to video
video_path = r"c:\Users\aksha\Downloads\open cv project\upstairs-Cam 03.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"❌ Error opening video: {video_path}")
    exit()

print(f"▶️ Processing {video_path}...")

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret: break
    
    frame_count += 1
    if frame_count % 10 != 0: continue # Process every 10th frame for speed
    
    # Run Detection
    detections = detector.detect(frame, check_helmet=True, check_vest=True)
    
    print(f"\n--- Frame {frame_count} ---")
    for i, d in enumerate(detections):
        status = d["status"]
        conf = d["conf"]
        print(f"  Person {i+1}: {status} (Conf: {conf:.2f})")
        print(f"    - Helmet: {'✅' if d['helmet'] else '❌'}")
        print(f"    - Vest:   {'✅' if d['vest'] else '❌'}")

cap.release()
print("\nDone.")
