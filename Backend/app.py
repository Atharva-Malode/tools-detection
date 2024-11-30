from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import asyncio

app = FastAPI()

# Load YOLOv8 model
model = YOLO("yolov8n.pt")  
video_path = 'video/test_video.mp4'


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get('/')
def home():
    return {"message" : "The Project is made by Priyanka ujainkar"}



def annotate_image(image: np.ndarray) -> str:
    """Run YOLOv8 model and return base64-encoded annotated image."""
    # Perform object detection
    results = model(image)

    # Plot the results on the image
    annotated_img = results[0].plot()

    # Convert BGR to RGB
    # annotated_img_rgb = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)

    # Convert the image to base64
    _, buffer = cv2.imencode('.jpg', annotated_img)
    img_bytes = buffer.tobytes()
    base64_img = base64.b64encode(img_bytes).decode('utf-8')

    return base64_img

@app.post("/detect/")
async def detect_objects(file: UploadFile = File(...)):
    try:
        # Read image bytes and convert to numpy array
        image_bytes = await file.read()
        image = np.array(Image.open(BytesIO(image_bytes)))

        # Annotate image and convert to base64
        annotated_base64 = annotate_image(image)

        return JSONResponse(content={"annotated_image": annotated_base64})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


def frame_to_base64(frame):
    """Converts a frame (OpenCV image) to a Base64-encoded string."""
    _, buffer = cv2.imencode('.jpg', frame)
    img_bytes = buffer.tobytes()
    base64_str = base64.b64encode(img_bytes).decode('utf-8')
    return base64_str

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(video_path)  # Use webcam or replace with video path

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Resize frame for display
            frame_resized = cv2.resize(frame, (800, 600))

            # Run YOLOv8 object detection and tracking
            results = model.track(source=frame_resized, show=False)

            # Draw bounding boxes on the frame
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = box.conf[0]
                    cls = int(box.cls[0])
                    label = f'{model.names[cls]} {conf:.2f}'
                    cv2.rectangle(frame_resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame_resized, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Convert frame to Base64
            base64_frame = frame_to_base64(frame_resized)

            # Send Base64-encoded frame over WebSocket
            await websocket.send_text(base64_frame)

    except WebSocketDisconnect:
        print("WebSocket disconnected.")
    finally:
        cap.release()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
