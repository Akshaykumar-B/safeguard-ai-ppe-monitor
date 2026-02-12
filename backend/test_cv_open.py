import cv2
import os

video_path = r"c:\Users\aksha\Downloads\open cv project\upstairs-Cam 03.mp4"

print(f"Path: {video_path}")
print(f"Exists: {os.path.exists(video_path)}")

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print("Error: Could not open video file with OpenCV")
else:
    ret, frame = cap.read()
    if ret:
        print("Success: Read frame from video")
    else:
        print("Error: Opened but could not read frame")
    cap.release()
