from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ai_model.predict import predict_disease
from database import init_db, save_prediction, get_predictions, save_user, login_user
from werkzeug.security import generate_password_hash, check_password_hash
import json
from urllib.request import urlopen
from urllib.parse import urlencode
from openai import OpenAI

app = Flask(__name__)
api_key = os.environ.get("OPENAI_API_KEY")

print("API KEY LOADED:", bool(api_key))

client = OpenAI(api_key=api_key)
CORS(app)
init_db()

@app.route("/analyze", methods=["POST"])
def analyze():

    if "image" not in request.files:
        return jsonify({
            "disease": "No image received",
            "suggestion": "Please upload a crop image",
            "confidence": "0%"
        }), 400

    image = request.files["image"]

    result = predict_disease(image)

    user_id = request.form.get("user_id")

    if not user_id:
        return jsonify({
            "message": "User ID required"
        }), 400

    save_prediction(
        user_id,
        result["disease"],
        result["suggestion"],
        result["confidence"]
    )

    return jsonify(result)



@app.route("/history", methods=["GET"])
def history():

    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({
            "message:" "user id required"
        }),400
    data =get_predictions(user_id)

    history = []

    for row in data:
        history.append({
            "disease": row[0],
            "suggestion": row[1],
            "confidence": row[2],
            "time": row[3]
        })

    return jsonify(history)

@app.route("/weather", methods=["GET"])
def weather():

    try:
        latitude = request.args.get("latitude")
        longitude = request.args.get("longitude")

        if not latitude or not longitude:
            return jsonify({
                "message": "Location coordinates required"
            }), 400

        params = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m",
            "timezone": "auto",
            "temperature_unit": "celsius",
            "wind_speed_unit": "kmh"
        })

        url = "https://api.open-meteo.com/v1/forecast?" + params

        with urlopen(url, timeout=10) as response:
            weather_data = json.loads(response.read().decode())

        current = weather_data["current"]

        weather_code = current["weather_code"]

        if weather_code == 0:
            condition = "Clear sky"
            icon = "☀️"
        elif weather_code in [1, 2, 3]:
            condition = "Partly cloudy"
            icon = "⛅"
        elif weather_code in [45, 48]:
            condition = "Foggy"
            icon = "🌫️"
        elif weather_code in [51, 53, 55, 56, 57]:
            condition = "Drizzle"
            icon = "🌦️"
        elif weather_code in [61, 63, 65, 66, 67]:
            condition = "Rain"
            icon = "🌧️"
        elif weather_code in [80, 81, 82]:
            condition = "Rain showers"
            icon = "🌦️"
        elif weather_code in [95, 96, 99]:
            condition = "Thunderstorm"
            icon = "⛈️"
        else:
            condition = "Cloudy"
            icon = "☁️"

        return jsonify({
            "location": f"{latitude}, {longitude}",
            "temperature": current["temperature_2m"],
            "condition": condition,
            "humidity": current["relative_humidity_2m"],
            "rainChance": current.get("precipitation_probability", 0),
            "windSpeed": current["wind_speed_10m"],
            "icon": icon
        })

    except Exception as e:

        print("Weather Error:", e)

        return jsonify({
            "message": "Unable to fetch weather"
        }), 500

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]

    hashed_password = generate_password_hash(password)

    success = save_user(name, email, hashed_password)

    if success:
        return jsonify({
            "message": "User registered successfully"
        }), 201

    return jsonify({
        "message": "Email already exists"
    }), 400 

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = login_user(email)

    if user and check_password_hash(user[3], password):
        return jsonify({
            "message": "Login successful",
            "user_id": user[0]
        }), 200

    return jsonify({
        "message": "Invalid email or password"
    }), 401   

@app.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.get_json()

        message = data.get("message", "").strip()

        if not message:
            return jsonify({
                "response": "Please ask me something about farming."
            }), 400

        response = client.responses.create(
           model="gpt-5-mini",
           input=f"""
You are Agrilense AI, a helpful farming assistant.

The user asks:
{message}

Give a concise and practical answer.
Focus on crop diseases, fertilizers, irrigation,
soil, weather-related farming advice, and general agriculture.

If the user needs a crop diagnosis, recommend using
Agrilense's image analysis feature instead of claiming
a certain diagnosis from text alone.
"""
)
        return jsonify({
            "response": response.output_text
        })

    except Exception as e:

        print("Chat Error:", e)

        return jsonify({
            "response": "Sorry, something went wrong."
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
    
     
    




