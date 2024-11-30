import cv2
from ultralytics import YOLO

# Load the YOLOv8 model
model = YOLO('yolov8n.pt')  # Replace with your model path

# Provide the path to the video file
cap = cv2.VideoCapture('video/test_video.mp4')  # Example: 'videos/sample.mp4'

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Resize frame to fit the window (optional)
    frame_resized = cv2.resize(frame, (800, 600))

    # Run YOLOv8 object detection and tracking
    results = model.track(source=frame_resized, show=False)

    # Draw detected boxes on the resized frame
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = box.conf[0]
            cls = int(box.cls[0])
            label = f'{model.names[cls]} {conf:.2f}'

            cv2.rectangle(frame_resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame_resized, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Display the frame
    cv2.imshow('YOLOv8 Object Tracking', frame_resized)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
