import pickle
import numpy as np

def serialize_encoding(encoding: np.ndarray) -> bytes:
    """Serialize a numpy array to bytes using pickle."""
    return pickle.dumps(encoding)

def deserialize_encoding(serialized_encoding: bytes) -> np.ndarray:
    """Deserialize bytes to a numpy array using pickle."""
    if serialized_encoding:
        return pickle.loads(serialized_encoding)
    return None
