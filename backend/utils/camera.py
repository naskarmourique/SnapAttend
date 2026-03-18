import cv2
import threading
import time

class Camera:
    def __init__(self, source=0):
        self.source = source
        self.cap = None
        self.lock = threading.Lock()

    def start(self):
        with self.lock:
            if self.cap is not None and self.cap.isOpened():
                return True
            
            # Try a sequence of common indices and backends
            # 0 is usually internal, 1/2 are usually external USB cams
            attempts = [
                (self.source, cv2.CAP_DSHOW), 
                (self.source, None),
                (1, cv2.CAP_DSHOW),
                (1, None),
                (2, cv2.CAP_DSHOW)
            ]
            
            for index, backend in attempts:
                try:
                    if backend is not None:
                        self.cap = cv2.VideoCapture(index, backend)
                    else:
                        self.cap = cv2.VideoCapture(index)
                        
                    if self.cap.isOpened():
                        # Set resolution for better performance
                        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        return True
                except:
                    continue
            
            return False

    def read_frame(self):
        # Using a timeout for the lock to avoid blocking the main thread if camera hangs
        if self.lock.acquire(timeout=0.1):
            try:
                if self.cap is not None and self.cap.isOpened():
                    ret, frame = self.cap.read()
                    if ret:
                        return frame
                return None
            finally:
                self.lock.release()
        return None

    def stop(self):
        with self.lock:
            if self.cap is not None:
                self.cap.release()
                self.cap = None

camera_instance = Camera()
