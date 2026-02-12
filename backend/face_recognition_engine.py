import cv2
import pickle
import os
import numpy as np

try:
    import face_recognition
    FACE_REC_AVAILABLE = True
except ImportError:
    FACE_REC_AVAILABLE = False
    print("⚠️  face_recognition library not found. Face recognition disabled.")

class FaceRecognitionEngine:
    def __init__(self, known_faces_dir='face_data', encodings_file='encodings.pickle'):
        if not FACE_REC_AVAILABLE:
            self.known_face_encodings = []
            self.known_face_names = []
            return

        self.known_faces_dir = known_faces_dir
        self.encodings_file = encodings_file
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_encodings()

    def load_encodings(self):
        """Load face encodings from file or generate them from images."""
        if not FACE_REC_AVAILABLE: return

        if os.path.exists(self.encodings_file):
            print(f"[INFO] Loading encodings from {self.encodings_file}...")
            with open(self.encodings_file, "rb") as f:
                data = pickle.load(f)
            self.known_face_encodings = data["encodings"]
            self.known_face_names = data["names"]
        else:
            print("[INFO] No encodings found. Scanning face_data directory...")
            self.encode_faces()

    def encode_faces(self):
        """Scan the dataset directory and encode faces."""
        if not FACE_REC_AVAILABLE: return

        if not os.path.exists(self.known_faces_dir):
            os.makedirs(self.known_faces_dir)
            
        image_paths = []
        for root, dirs, files in os.walk(self.known_faces_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_paths.append(os.path.join(root, file))

        known_encodings = []
        known_names = []

        for (i, image_path) in enumerate(image_paths):
            print(f"[INFO] Processing image {i + 1}/{len(image_paths)}: {image_path}")
            name = image_path.split(os.path.sep)[-2]  # Assuming folder name is person's name

            image = cv2.imread(image_path)
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            boxes = face_recognition.face_locations(rgb, model="hog")
            encodings = face_recognition.face_encodings(rgb, boxes)

            for encoding in encodings:
                known_encodings.append(encoding)
                known_names.append(name)

        data = {"encodings": known_encodings, "names": known_names}
        with open(self.encodings_file, "wb") as f:
            f.write(pickle.dumps(data))
        
        self.known_face_encodings = known_encodings
        self.known_face_names = known_names
        print(f"[INFO] Serialized {len(known_encodings)} encodings.")

    def recognize_face(self, frame, bbox=None):
        """
        Recognize faces in a frame.
        If bbox is provided (x, y, w, h), it only looks in that region.
        """
        if not FACE_REC_AVAILABLE:
            return []

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        if bbox:
            x, y, w, h = bbox
            # Convert to (top, right, bottom, left)
            boxes = [(y, x + w, y + h, x)]
        else:
            boxes = face_recognition.face_locations(rgb, model="hog")

        encodings = face_recognition.face_encodings(rgb, boxes)
        names = []

        for encoding in encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, encoding)
            name = "Unknown"

            if True in matches:
                matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                counts = {}
                for i in matchedIdxs:
                    name = self.known_face_names[i]
                    counts[name] = counts.get(name, 0) + 1
                name = max(counts, key=counts.get)
            
            names.append(name)
        
        return zip(boxes, names)
