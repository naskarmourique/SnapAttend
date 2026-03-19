import sys
import os
sys.path.append(os.getcwd())

from config.database import SessionLocal, engine, Base
from models.admin_model import Admin
from routes.auth import get_password_hash, verify_password

def check_db():
    print("--- SnapAttend DB Diagnostic ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_count = db.query(Admin).count()
        print(f"Admin count: {admin_count}")
        
        if admin_count == 0:
            print("Creating default admin...")
            new_admin = Admin(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator"
            )
            db.add(new_admin)
            db.commit()
            print("Admin created successfully.")
        else:
            admin = db.query(Admin).filter(Admin.username == "admin").first()
            if admin:
                print(f"Found admin: {admin.username}")
                is_correct = verify_password("admin123", admin.hashed_password)
                print(f"Password 'admin123' valid: {is_correct}")
            else:
                print("Admin user 'admin' not found in table.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
