from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from config.database import get_db
from utils.camera import camera_instance
from services.face_service import face_service
from services.liveness_service import liveness_service
from services.attendance_service import attendance_service
import asyncio
import time
import cv2
import numpy as np
import threading

from routes.auth import get_current_user

router = APIRouter(prefix="/recognition", tags=["Recognition"])

# State variables
is_running = False
camera_active = False
state_lock = threading.Lock()

async def recognition_loop(db_session_factory, started_by_id: str, started_by_role: str):
    global is_running
    # Track faces across frames: {roll: {"first_seen": time, "last_seen": time, "live_count": count}}
    active_faces = {}
    frame_counter = 0

    print(f"\n[SYSTEM] Live Recognition Started by {started_by_role} ({started_by_id})...")

    while True:
        with state_lock:
            if not is_running:
                break
        
        frame = camera_instance.read_frame()
        if frame is None:
            await asyncio.sleep(0.1)
            continue
            
        frame_counter += 1
        # Process every 2nd frame for better speed
        if frame_counter % 2 != 0:
            await asyncio.sleep(0.01)
            continue

        # 1. Perform Multi-Face Recognition (Async)
        recognized_results = await face_service.recognize_faces(frame)
        
        # 2. Check Liveness for the whole frame (simplification)
        # In a high-end system, we'd check each face's ROI
        is_live = liveness_service.detect_liveness(frame)
        
        current_time = time.time()
        db = next(db_session_factory())
        
        try:
            for res in recognized_results:
                roll = res["roll_number"]
                score = res["confidence"]

                # FIX: If started by a student, only allow recognition of themselves
                if started_by_role == "student" and roll != started_by_id:
                    # Optional: log attempt to mark someone else
                    # print(f"[SECURITY] Student {started_by_id} tried to mark attendance for {roll}")
                    continue

                if roll not in active_faces:
                    # Initialize tracking
                    active_faces[roll] = {
                        "first_seen": current_time, 
                        "last_seen": current_time, 
                        "live_frames": 1 if is_live else 0
                    }
                else:
                    active_faces[roll]["last_seen"] = current_time
                    if is_live:
                        active_faces[roll]["live_frames"] += 1
                
                # Simplified Attendance Logic:
                # If we have seen them live at least once, mark attendance immediately.
                if active_faces[roll]["live_frames"] >= 1:
                    from models.student_model import Student
                    student = db.query(Student).filter(Student.roll_number == roll).first()
                    if student: 
                        marked = attendance_service.mark_attendance(db, student.id, score)
                        if marked:
                            print(f"[SUCCESS] Attendance Recorded: {student.name} ({roll})")
                            # Prevent spamming the DB for this roll in this session
                            active_faces[roll]["live_frames"] = -9999 
                elif frame_counter % 10 == 0:
                    print(f"[WARNING] Spoof Attempt or Poor Lighting for {roll}")
            
            # 4. Cleanup inactive faces (gone for > 5 sec to account for processing delays)
            active_faces = {k: v for k, v in active_faces.items() if current_time - v["last_seen"] < 5.0}
            
        finally:
            db.close()
            
        await asyncio.sleep(0.01)

@router.post("/camera/start")
def start_camera(current_user: str = Depends(get_current_user)):
    global camera_active
    with state_lock:
        if camera_instance.start():
            camera_active = True
            return {"message": "Camera started"}
    raise HTTPException(status_code=500, detail="Could not start camera")

@router.post("/camera/stop")
def stop_camera(current_user: str = Depends(get_current_user)):
    global camera_active, is_running
    with state_lock:
        is_running = False
        camera_active = False
    camera_instance.stop()
    return {"message": "Camera stopped"}

@router.post("/start")
async def start_recognition(background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    global is_running, camera_active
    with state_lock:
        if is_running: return {"message": "Already running"}
        if not camera_instance.start(): 
            raise HTTPException(status_code=500, detail="Camera fail")
        is_running = True
        camera_active = True
    
    # Identify who is starting the session
    started_by_id = current_user.username if current_user.role == "admin" else current_user.roll_number
    started_by_role = current_user.role

    background_tasks.add_task(recognition_loop, get_db, started_by_id, started_by_role)
    return {"message": f"Recognition started by {started_by_role}"}

@router.post("/stop")
def stop_recognition(current_user: str = Depends(get_current_user)):
    global is_running, camera_active
    with state_lock:
        is_running = False
        camera_active = False
    camera_instance.stop()
    return {"message": "Recognition stopped"}

@router.get("/status")
def recognition_status(current_user: str = Depends(get_current_user)):
    global is_running, camera_active
    return {"is_running": is_running, "camera_active": camera_active}

@router.get("/snapshot")
def get_snapshot():
    if not camera_instance.start():
        raise HTTPException(status_code=500, detail="Camera not available")
    frame = camera_instance.read_frame()
    if frame is None:
        raise HTTPException(status_code=500, detail="Could not capture frame")
    
    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        raise HTTPException(status_code=500, detail="Encoding error")
        
    return Response(content=buffer.tobytes(), media_type="image/jpeg")

def gen_frames():
    while True:
        with state_lock:
            active = camera_active
            
        if not active:
            img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(img, "Camera Inactive", (150, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (100, 100, 100), 2)
            _, buffer = cv2.imencode('.jpg', img)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.5)
            continue

        frame = camera_instance.read_frame()
        if frame is None:
            time.sleep(0.01)
            continue
        
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret: continue
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@router.get("/video_feed")
def video_feed():
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
