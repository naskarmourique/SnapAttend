from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base, SessionLocal
from routes import students, attendance, analytics, recognition, auth, student_me
from models import admin_model
from services.face_service import face_service
import uvicorn
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    
    # Create default admin if not exists
    db = SessionLocal()
    try:
        from models.admin_model import Admin
        from routes.auth import get_password_hash
        if db.query(Admin).count() == 0:
            print("[SYSTEM] No admin found. Creating default 'admin' account...")
            admin = Admin(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator"
            )
            db.add(admin)
            db.commit()
            print("[SUCCESS] Default admin created: admin / admin123")
        
        # Load face encodings into memory
        count = face_service.load_encodings(db)
        print(f"Loaded {count} face encodings into memory.")
    finally:
        db.close()
        
    yield
    # Shutdown
    from utils.camera import camera_instance
    camera_instance.stop()

app = FastAPI(title="SnapAttend API", lifespan=lifespan)

# CORS - Specific origins are required when using allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(student_me.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(analytics.router)
app.include_router(recognition.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SnapAttend API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
