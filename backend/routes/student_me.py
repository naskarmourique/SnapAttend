from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from routes.auth import get_current_user

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role == "student":
        return {
            "id": current_user.id,
            "name": current_user.name,
            "roll_number": current_user.roll_number,
            "department": current_user.department,
            "created_at": current_user.created_at,
            "role": "student"
        }
    elif current_user.role == "admin":
        return {
            "id": current_user.id,
            "name": current_user.full_name,
            "roll_number": "ADMIN",
            "department": "Administration",
            "role": "admin"
        }
    
    raise HTTPException(status_code=403, detail="Unknown role")
