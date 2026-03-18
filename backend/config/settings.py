import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/snapattend")
    LIVENESS_THRESHOLD = float(os.getenv("LIVENESS_THRESHOLD", "0.2"))
    RECOGNITION_TOLERANCE = float(os.getenv("RECOGNITION_TOLERANCE", "0.5"))

settings = Settings()
