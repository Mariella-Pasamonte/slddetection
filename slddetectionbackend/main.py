from fastapi import FastAPI, HTTPException, UploadFile, File
import mediapipe as mp
import numpy as np
import pickle
import os

app = FastAPI()


model_path = os.path.join(os.path.dirname(__file__), "model", "aslModel(a-cAndKira)150(80-20-100).pkl")

with open(model_path, "rb") as f:
    model=pickle.load(f)

print("hello world!")

@app.post("/predict/")

def predict_landmarks(file: UploadFile = File(...)):
    try:
        prediction = model.predict()
        return {"prediction": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="192.168.1.11", port=8000)