from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.attendance_model import Attendance
from models.student_model import Student
from datetime import date

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

@router.get("/{student_id}")
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    attendances = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return attendances
