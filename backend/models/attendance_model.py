from sqlalchemy import Column, Integer, Date, Time, Float, ForeignKey
from config.database import Base
from sqlalchemy.orm import relationship

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date, index=True)
    time = Column(Time)
    confidence_score = Column(Float)

    student = relationship("Student", back_populates="attendances")
