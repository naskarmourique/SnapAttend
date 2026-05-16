from sqlalchemy import Column, Integer, String, LargeBinary, DateTime
from config.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    roll_number = Column(String(50), unique=True, index=True)
    department = Column(String(100))
    face_encoding = Column(LargeBinary)
    image_path = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
