from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import face_recognition
import numpy as np
from PIL import Image
import io
import base64
import json

app = FastAPI(title="FaceLens ML Microservice")

class CompareRequest(BaseModel):
    embedding1: str # Base64 encoded string
    embedding2: str # Base64 encoded string

class BulkCompareRequest(BaseModel):
    target_embedding: str
    gallery_embeddings: list[str]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/detect")
async def detect_faces(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)
        
        # Find face locations and encodings
        face_locations = face_recognition.face_locations(image_np)
        face_encodings = face_recognition.face_encodings(image_np, face_locations)
        
        results = []
        for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
            # Encode embedding as base64 string
            encoding_bytes = encoding.tobytes()
            encoding_b64 = base64.b64encode(encoding_bytes).decode('utf-8')
            
            results.append({
                "bounding_box": {"y": top, "x": left, "h": bottom - top, "w": right - left}, # y, x, h, w
                "embedding": encoding_b64
            })
            
        return {"faces": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare")
def compare_faces(req: CompareRequest):
    try:
        # Decode embeddings from base64
        emb1_bytes = base64.b64decode(req.embedding1)
        emb2_bytes = base64.b64decode(req.embedding2)
        
        # Convert to numpy array
        emb1 = np.frombuffer(emb1_bytes, dtype=np.float64)
        emb2 = np.frombuffer(emb2_bytes, dtype=np.float64)
        
        # Calculate face distance
        # face_distance returns a distance (lower is more similar). 0.6 is typical threshold
        distances = face_recognition.face_distance([emb1], emb2)
        similarity = 1.0 - distances[0] # Convert distance to similarity (higher is better)
        
        # Typical match threshold is distance < 0.6 => similarity > 0.4
        is_match = distances[0] < 0.6
        
        return {
            "is_match": bool(is_match),
            "distance": float(distances[0]),
            "similarity": float(similarity)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bulk_compare")
def bulk_compare_faces(req: BulkCompareRequest):
    try:
        # Decode target embedding
        target_bytes = base64.b64decode(req.target_embedding)
        target_emb = np.frombuffer(target_bytes, dtype=np.float64)
        
        # Decode gallery embeddings
        gallery_embs = []
        for g_emb_b64 in req.gallery_embeddings:
            g_bytes = base64.b64decode(g_emb_b64)
            g_emb = np.frombuffer(g_bytes, dtype=np.float64)
            gallery_embs.append(g_emb)
            
        if not gallery_embs:
            return {"matches": []}
            
        distances = face_recognition.face_distance(gallery_embs, target_emb)
        
        results = []
        for i, distance in enumerate(distances):
            is_match = distance < 0.55 # Using a slightly stricter threshold to avoid false positives
            similarity = 1.0 - distance
            results.append({
                "index": i,
                "is_match": bool(is_match),
                "distance": float(distance),
                "similarity": float(similarity) # Convert distance to similarity
            })
            
        return {"matches": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
