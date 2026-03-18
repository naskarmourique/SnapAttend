from sqlalchemy.orm import Session
from models.attendance_model import Attendance
from datetime import date, datetime

class AttendanceService:
    def mark_attendance(self, db: Session, student_id: int, confidence_score: float) -> bool:
        """Finalized Attendance Marking: Prevents duplicate marking for the same student on the same day."""
        today = date.today()
        
        # Check if student already marked today
        existing = db.query(Attendance).filter(
            Attendance.student_id == student_id, 
            Attendance.date == today
        ).first()
        
        if existing:
            # Already marked, so we just return True without adding a new record
            return True

        current_time = datetime.now().time()
        print(f"[ATTENDANCE] Final Recording: {student_id} at {current_time}")
        
        new_attendance = Attendance(
            student_id=student_id,
            date=today,
            time=current_time,
            confidence_score=confidence_score
        )
        
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        return True

attendance_service = AttendanceService()
