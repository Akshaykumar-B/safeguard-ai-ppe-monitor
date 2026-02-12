# SafeGuard AI - Real World Detection Guide

You are now using a **YOLOv8 + Hybrid Logic** system. This is much closer to a real-world deployment than the previous version.

## How it works (The Upgrade)

1.  **Person Detection (YOLOv8):** We use a deep learning model (`yolov8n.pt`) to find people with high accuracy, even in complex scenes. This is the same technology used in self-driving cars and modern CCTV analytics.
2.  **PPE Compliance (Color Logic):** Once a person is found, we analyze specific body regions:
    *   **Head (Helmet):** Checks for **Yellow** or **White** pixels in the top 25% of the person.
    *   **Body (Vest):** Checks for **Orange** or **Green** pixels in the middle 50% of the person.

## "Do we need to train a model?"

**Short Answer: Not necessarily.**
The current hybrid approach works surprisingly well for standard uniforms (Yellow/White Helmets + Orange/Green Vests).

**Long Answer: Yes, for specific gear.**
If your workers wear **Blue Helmets** or **Black Vests**, the color logic will fail. You have two options:

### Option A: Adjust Colors (Easy)
Edit `backend/yolo_logic.py` and change the HSV ranges to match your specific gear colors.

### Option B: Train a Custom Model (Advanced)
If you want the AI to detect "Helmet" as a distinct object (regardless of color) or "Gloves" or "Goggles", you **must train a custom YOLO model**.

#### How to Train (If you get data):
1.  **Collect Data:** Take 500+ photos of your workers.
2.  **Label Data:** Use a tool like [Roboflow](https://roboflow.com) to draw boxes around `helmet`, `vest`, `person`, `no_helmet`, etc.
3.  **Train:**
    Run this command in the backend folder:
    ```bash
    yolo task=detect mode=train model=yolov8n.pt data=dataset.yaml epochs=100
    ```
4.  **Use It:**
    Update `yolo_logic.py` to load your new model:
    ```python
    self.model = YOLO("runs/detect/train/weights/best.pt")
    ```

For now, the **Hybrid Logic (Person + Color)** is the best "real-world" simulation without spending weeks on data collection.
