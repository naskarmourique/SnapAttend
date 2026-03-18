from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from config.database import get_db
from models.student_model import Student
from services.face_service import face_service
from utils.encoding import serialize_encoding
import os
import shutil

router = APIRouter(prefix="/students", tags=["Students"])

from typing import List

@router.post("/register")
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    department: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # Check if student exists
    if db.query(Student).filter(Student.roll_number == roll_number).first():
        raise HTTPException(status_code=400, detail="Student already exists with this roll number")

    # Read all images
    all_contents = []
    for file in files:
        contents = await file.read()
        all_contents.append(contents)
    
    # Extract robust encoding from multiple samples
    encoding = face_service.extract_encoding(all_contents)
    if encoding is None:
        raise HTTPException(status_code=400, detail="No face detected in the provided images")

    # Create student-specific directory
    upload_dir = f"uploads/students/{roll_number}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save all images to the directory
    for i, contents in enumerate(all_contents):
        file_path = os.path.join(upload_dir, f"sample_{i}.jpg")
        with open(file_path, "wb") as f:
            f.write(contents)

    # Save to DB (storing directory path as image_path)
    new_student = Student(
        name=name,
        roll_number=roll_number,
        department=department,
        face_encoding=serialize_encoding(encoding),
        image_path=upload_dir
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # Reload optimized encodings into RAM
    face_service.load_encodings(db)

    return {"message": f"Student registered successfully with {len(all_contents)} samples", "id": new_student.id}


@router.get("/")
def get_students(db: Session = Depends(get_db)):
    print("[API] GET /students - Fetching all students")
    students = db.query(Student).all()
    print(f"[API] Found {len(students)} students")
    return [{"id": s.id, "name": s.name, "roll_number": s.roll_number, "department": s.department} for s in students]

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    if student.image_path and os.path.exists(student.image_path):
        if os.path.isdir(student.image_path):
            shutil.rmtree(student.image_path)
        else:
            os.remove(student.image_path)
        
    db.delete(student)
    db.commit()
    
    # Reload encodings
    face_service.load_encodings(db)
    
    return {"message": "Student deleted successfully"}
