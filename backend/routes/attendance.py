from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from models.attendance_model import Attendance
from models.student_model import Student
from services.attendance_service import attendance_service
from fastapi.responses import StreamingResponse
import pandas as pd
import io
from datetime import date
from routes.auth import get_current_user

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("/")
def get_all_attendance(db: Session = Depends(get_db)):
    # Use a JOIN to fetch student names in a single efficient query
    attendances = db.query(
        Attendance.id,
        Attendance.student_id,
        Attendance.date,
        Attendance.time,
        Attendance.confidence_score,
        Student.name.label("student_name")
    ).join(Student, Attendance.student_id == Student.id).order_by(Attendance.id.desc()).all()
    
    return [dict(att._mapping) for att in attendances]

@router.post("/manual")
def mark_manual(
    roll_number: str, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.roll_number == roll_number).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if student already marked today
    attendance_service.mark_attendance(db, student.id, 1.0)
    return {"message": f"Attendance marked manually for {student.name}"}

@router.get("/export")
def export_attendance(db: Session = Depends(get_db)):
    logs = db.query(Attendance).join(Student).all()
    data = [
        {
            "Student Name": log.student.name,
            "Roll Number": log.student.roll_number,
            "Department": log.student.department,
            "Date": log.date,
            "Time": log.time,
            "Confidence": log.confidence_score
        }
        for log in logs
    ]
    
    if not data:
        raise HTTPException(status_code=404, detail="No attendance logs to export")
        
    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    return StreamingResponse(
        io.BytesIO(stream.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_{date.today()}.csv"}
    )

@router.get("/{student_id}")
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    attendances = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return attendances
