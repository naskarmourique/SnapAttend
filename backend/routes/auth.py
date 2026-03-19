from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from config.database import get_db
from models.admin_model import Admin
from models.student_model import Student
from pydantic import BaseModel

# Configuration
SECRET_KEY = "SnapAttendSecretSecureKey" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["Auth"])

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserResponse(BaseModel):
    username: str
    full_name: str
    role: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if role == "admin":
        user = db.query(Admin).filter(Admin.username == username).first()
    else:
        # For students, 'sub' is their roll_number (unique ID)
        user = db.query(Student).filter(Student.roll_number == username).first()
        
    if user is None:
        raise credentials_exception
    
    # Attach role to the user object dynamically for routes to use
    user.role = role
    return user

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"[LOGIN DEBUG] Attempt: {form_data.username}")
    
    # 1. Try Admin Login first
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    if admin and verify_password(form_data.password, admin.hashed_password):
        access_token = create_access_token(
            data={"sub": admin.username, "role": "admin"}
        )
        return {"access_token": access_token, "token_type": "bearer", "role": "admin"}
    
    # 2. Try Student Login (Name as username, Roll as password)
    student = db.query(Student).filter(
        Student.name == form_data.username, 
        Student.roll_number == form_data.password
    ).first()
    
    if student:
        # Note: For students, we use roll_number as the unique identifier in the token
        access_token = create_access_token(
            data={"sub": student.roll_number, "role": "student"}
        )
        return {"access_token": access_token, "token_type": "bearer", "role": "student"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Union[Admin, Student] = Depends(get_current_user)):
    if current_user.role == "admin":
        return {
            "username": current_user.username, 
            "full_name": current_user.full_name, 
            "role": "admin"
        }
    return {
        "username": current_user.roll_number, 
        "full_name": current_user.name, 
        "role": "student"
    }

@router.post("/setup-root", include_in_schema=False)
def setup_root(db: Session = Depends(get_db)):
    if db.query(Admin).count() == 0:
        root = Admin(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator"
        )
        db.add(root)
        db.commit()
        return {"msg": "Root user created: admin / admin123"}
    return {"msg": "Root user already exists"}
