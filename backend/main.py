from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base, SessionLocal
from routes import students, attendance, analytics, recognition
from services.face_service import face_service
import uvicorn
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    
    # Load face encodings into memory
    db = SessionLocal()
    try:
        count = face_service.load_encodings(db)
        print(f"Loaded {count} face encodings into memory.")
    finally:
        db.close()
        
    yield
    # Shutdown
    from utils.camera import camera_instance
    camera_instance.stop()

app = FastAPI(title="SnapAttend API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(analytics.router)
app.include_router(recognition.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SnapAttend API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
