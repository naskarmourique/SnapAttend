import os
import shutil
import sys

# Add the current directory to path to find config and models
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from config.settings import settings
from models.attendance_model import Attendance
from models.student_model import Student
from sqlalchemy.orm import sessionmaker

# Setup database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset_database():
    print("[SYSTEM] Starting fresh reset with ID reset...")
    db = SessionLocal()
    try:
        # 1. Clear Tables and Reset Auto-Increment
        print("Truncating Attendance table...")
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.execute(text("TRUNCATE TABLE attendance;"))
        
        print("Truncating Student table...")
        db.execute(text("TRUNCATE TABLE students;"))
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        
        db.commit()
        print("Database tables truncated and IDs reset successfully.")

        # 2. Clear Uploads
        upload_dir = "uploads/students"
        if os.path.exists(upload_dir):
            print(f"Clearing student images in {upload_dir}...")
            for filename in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f'Failed to delete {file_path}. Reason: {e}')
            print("Uploads folder cleared.")
        
        print("\n[SUCCESS] System reset complete. Ready for production.")

    except Exception as e:
        print(f"[ERROR] Reset failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
