import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

# load trained model
model = tf.keras.models.load_model("agrilense_model.keras")

classes = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy"
]

# yaha apni image ka naam likhna
img = image.load_img(
    "tomato.jpg",
    target_size=(224,224)
)

img_array = image.img_to_array(img)
img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array)

index = np.argmax(prediction)

print("Prediction:", classes[index])
print("Confidence:", prediction[0][index]*100)