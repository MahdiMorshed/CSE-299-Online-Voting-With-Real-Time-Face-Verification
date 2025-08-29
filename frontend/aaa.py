import tensorflow as tf
import cv2
import os
import random
import numpy as np
from matplotlib import pyplot as plt
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Layer,Conv2D,Dense,MaxPooling2D,Input,Flatten
POS_PATH=os.path.join('data','positive')
NEG_PATH=os.path.join('data','negative')
ANC_PATH=os.path.join('data','anchor')

os.makedirs(POS_PATH, exist_ok=True)
os.makedirs(NEG_PATH, exist_ok=True)
os.makedirs(ANC_PATH, exist_ok=True)

import shutil

# Define paths
LFW_PATH = r'C:\Users\mahdi\OneDrive\Desktop\cse299\alpha2\lfw_funneled'
NEG_PATH = r'C:\Users\mahdi\OneDrive\Desktop\cse299\alpha2\data\negative'

os.makedirs(NEG_PATH, exist_ok=True)

if not os.path.exists(LFW_PATH):
    raise FileNotFoundError(f"Source folder not found: {LFW_PATH}")

for subfolder in os.listdir(LFW_PATH):
    subfolder_path = os.path.join(LFW_PATH, subfolder)
    if os.path.isdir(subfolder_path):
        for filename in os.listdir(subfolder_path):
            file_path = os.path.join(subfolder_path, filename)

            if os.path.isfile(file_path):
                new_filename = f"{subfolder}_{filename}"
                new_path = os.path.join(NEG_PATH, new_filename)
                shutil.move(file_path, new_path)

print(" Only image files moved into 'data/negative'.")


face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

img_id = 0 
while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to read frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        face_crop = frame[y:y + h, x:x + w]
        face_resized = cv2.resize(face_crop, (250, 250))

        cv2.imshow("Detected Face (250x250)", face_resized)

        key = cv2.waitKey(1)
        if key == ord('s'):
            filename = f"captured_face_{img_id}.jpg"
            cv2.imwrite(filename, face_resized)
            print(f"Saved: {filename}")
            img_id += 1

        break  
    cv2.imshow("Webcam", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
cv2.waitKey(1)
from IPython.display import display
from PIL import Image


face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
face_pil = Image.fromarray(face_rgb)

display(face_pil)