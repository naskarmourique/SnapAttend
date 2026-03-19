import cv2
import numpy as np
from sqlalchemy.orm import Session
from models.student_model import Student
from config.settings import settings
import os
from deepface import DeepFace
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Disable excessive TF logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

class FaceService:
    def __init__(self):
        self.model_name = "Facenet512" 
        self.live_detector = "opencv"
        self.reg_detector = "retinaface" 
        self.is_loaded = False
        self.db_path = "uploads/students"
        self.embeddings_cache = {} 
        self.executor = ThreadPoolExecutor(max_workers=1)
        os.makedirs(self.db_path, exist_ok=True)

    def preprocess_image(self, img):
        if img is None: return None
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl1 = clahe.apply(gray)
        enhanced_img = cv2.cvtColor(cl1, cv2.COLOR_GRAY2BGR)
        return enhanced_img

    async def _represent_async(self, img_path, detector):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            lambda: DeepFace.represent(
                img_path=img_path,
                model_name=self.model_name,
                enforce_detection=False,
                detector_backend=detector,
                align=True
            )
        )

    def load_encodings(self, db: Session):
        print("\n[DEBUG] --- LOADING STUDENT DATABASE (OPTIMIZED) ---")
        students = db.query(Student).all()
        self.embeddings_cache = {}
        
        count = 0
        for student in students:
            if student.image_path and os.path.exists(student.image_path):
                try:
                    images_to_process = []
                    if os.path.isdir(student.image_path):
                        for f in os.listdir(student.image_path):
                            if f.endswith(('.jpg', '.jpeg', '.png')):
                                images_to_process.append(os.path.join(student.image_path, f))
                    else:
                        images_to_process.append(student.image_path)

                    all_embeddings = []
                    for img_p in images_to_process:
                        img = cv2.imread(img_p)
                        img = self.preprocess_image(img)
                        
                        # Use synchronous represent here as it's during startup
                        objs = DeepFace.represent(
                            img_path=img,
                            model_name=self.model_name,
                            enforce_detection=False,
                            detector_backend=self.reg_detector,
                            align=True
                        )
                        if objs:
                            all_embeddings.append(np.array(objs[0]["embedding"]))
                    
                    if all_embeddings:
                        mean_embedding = np.mean(all_embeddings, axis=0).tolist()
                        self.embeddings_cache[student.roll_number] = {
                            "embedding": mean_embedding,
                            "name": student.name
                        }
                        count += 1
                except Exception as e:
                    print(f"[DEBUG] Failed to load {student.roll_number}: {e}")
        
        self.is_loaded = True
        print(f"[DEBUG] Loaded {count} students into high-speed cache")
        return count

    def extract_encoding(self, image_bytes_list: list):
        all_embeddings = []
        for img_bytes in image_bytes_list:
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img = self.preprocess_image(img)
            
            try:
                objs = DeepFace.represent(
                    img_path=img,
                    model_name=self.model_name,
                    detector_backend=self.reg_detector,
                    enforce_detection=True,
                    align=True
                )
                if objs:
                    all_embeddings.append(np.array(objs[0]["embedding"]))
            except:
                continue
        
        if not all_embeddings:
            return None
        return np.mean(all_embeddings, axis=0).tolist()

    async def recognize_faces(self, frame: np.ndarray):
        if not self.is_loaded or not self.embeddings_cache:
            return []

        recognized_students = []
        processed_frame = self.preprocess_image(frame)
        
        try:
            face_objs = await self._represent_async(processed_frame, self.live_detector)

            for face in face_objs:
                if "embedding" not in face: continue
                
                live_embedding = np.array(face["embedding"])
                best_match = None
                highest_sim = -1.0
                
                for roll, data in self.embeddings_cache.items():
                    cached_vec = np.array(data["embedding"])
                    sim = np.dot(live_embedding, cached_vec) / (np.linalg.norm(live_embedding) * np.linalg.norm(cached_vec))
                    
                    if sim > highest_sim:
                        highest_sim = sim
                        best_match = roll
                
                if best_match and highest_sim > 0.30:
                    recognized_students.append({
                        "roll_number": best_match,
                        "confidence": float(highest_sim)
                    })
        except Exception as e:
            print(f"[DEBUG] Recognition error: {e}")
            pass

        return recognized_students

face_service = FaceService()
