from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.attendance_model import Attendance
from models.student_model import Student
from datetime import date

from services.attendance_service import attendance_service

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
    return db.query(Attendance).filter(Attendance.student_id == student_id).all()

@router.post("/manual/mark")
def manual_mark(student_id: int, db: Session = Depends(get_db)):
    attendance_service.mark_attendance(db, student_id, 1.0)
    return {"message": "Attendance marked manually"}

@router.post("/manual/remove")
def manual_remove(student_id: int, log_date: str, db: Session = Depends(get_db)):
    from datetime import datetime
    try:
        target_date = datetime.strptime(log_date, '%Y-%m-%d').date()
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.date == target_date
    ).delete()
    db.commit()
    return {"message": "Attendance record removed"}
