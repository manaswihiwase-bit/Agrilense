import tensorflow as tf
import numpy as np
from PIL import Image
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "agrilense_model.keras")
model = tf.keras.models.load_model(MODEL_PATH)

classes = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy"
]

suggestions = {
    "Potato___Early_blight": "Use Mancozeb fungicide and avoid overhead irrigation.",
    "Potato___Late_blight": "Apply Metalaxyl-based fungicide immediately.",
    "Potato___healthy": "Plant is healthy. Continue regular care.",
    "Tomato___Early_blight": "Use Chlorothalonil fungicide and remove infected leaves.",
    "Tomato___Late_blight": "Apply Copper-based fungicide and improve air circulation.",
    "Tomato___healthy": "Plant is healthy. Continue regular care."
}

def predict_disease(image_file):
    img = Image.open(image_file).convert("RGB")
    img = img.resize((224, 224))

    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)

    index = np.argmax(prediction)
    confidence = float(np.max(prediction) * 100)

    disease = classes[index]

    return {
        "disease": disease,
        "suggestion": suggestions[disease],
        "confidence": f"{confidence:.2f}%"
    }