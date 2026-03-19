from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from models.attendance_model import Attendance
from models.student_model import Student
from sqlalchemy import func
from datetime import date
import calendar

from routes.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"], dependencies=[Depends(get_current_user)])

@router.get("/daily")
def get_daily_analytics(db: Session = Depends(get_db)):
    today = date.today()
    total_students = db.query(Student).count()
    # Final: Count unique students present today, ignoring any NULL student_ids
    present_today = db.query(Attendance.student_id).filter(
        Attendance.date == today,
        Attendance.student_id != None
    ).distinct().count()
    
    # Absent count reduces but never goes below 0
    absent_today = max(0, total_students - present_today)
    
    return {
        "present": present_today,
        "absent": absent_today,
        "total": total_students,
        "mode": "Final Production"
    }

@router.get("/monthly")
def get_monthly_analytics(db: Session = Depends(get_db)):
    today = date.today()
    current_month = today.month
    current_year = today.year
    
    month_name = calendar.month_name[current_month]
    
    # Total students in the system
    total_students = db.query(Student).count()
    
    # Days in month till today
    days_passed = today.day
    
    total_possible_attendance = total_students * days_passed
    if total_possible_attendance == 0:
        return {"month": month_name, "attendance_rate": 0}
        
    # Count unique student-day pairs to ignore multiple logs for same student on same day
    actual_attendance = db.query(Attendance.student_id, Attendance.date).filter(
        func.extract('month', Attendance.date) == current_month,
        func.extract('year', Attendance.date) == current_year
    ).distinct().count()
    
    rate = (actual_attendance / total_possible_attendance) * 100
    
    return {
        "month": month_name,
        "attendance_rate": round(rate, 2)
    }

@router.get("/low-attendance")
def get_low_attendance(threshold: float = 75.0, db: Session = Depends(get_db)):
    today = date.today()
    days_passed = today.day # simplify
    
    if days_passed == 0:
        return {"students": []}
        
    students = db.query(Student).all()
    low_attendance_students = []
    
    for student in students:
        # Count unique days the student was present this month
        att_count = db.query(Attendance.date).filter(
            Attendance.student_id == student.id,
            func.extract('month', Attendance.date) == today.month
        ).distinct().count()
        
        attendance_percentage = (att_count / days_passed) * 100
        if attendance_percentage < threshold:
            low_attendance_students.append({
                "name": student.name,
                "attendance": round(attendance_percentage, 2)
            })
            
    return {"students": low_attendance_students}
