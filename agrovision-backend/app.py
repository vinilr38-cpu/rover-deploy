from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime
import json
import os
import random
from random import randint

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect("sensor.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature INTEGER,
            humidity INTEGER,
            soil_moisture INTEGER,
            timestamp TEXT
        )
    """)

    conn.commit()
    conn.close()

@app.route('/api/sensor-data', methods=['GET'])
def sensor_data():
    temperature = randint(20, 35)
    humidity = randint(40, 80)
    soil_moisture = randint(30, 70)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect("sensor.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO sensor_data (temperature, humidity, soil_moisture, timestamp)
        VALUES (?, ?, ?, ?)
    """, (temperature, humidity, soil_moisture, timestamp))

    conn.commit()
    conn.close()

    return jsonify({
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
        "timestamp": timestamp
    })

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'logs.json')

users = {
    "admin@gmail.com": {
        "password": "1234",
        "role": "admin"
    },
    "farmer@gmail.com": {
        "password": "1234",
        "role": "farmer"
    }
}

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {
        "temperature": 28.0,
        "humidity": 65,
        "pest_count": 3,
        "spray_status": "OFF",
        "crop_health": "Good",
        "last_updated": ""
    }

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def log_event(action, mode="Manual", user="Farmer Vinil"):
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                logs = json.load(f)
        except:
            logs = []
    
    new_log = {
        "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "action": action,
        "mode": mode,
        "user": user
    }
    logs.insert(0, new_log)
    with open(LOG_FILE, 'w') as f:
        json.dump(logs[:100], f, indent=2)

@app.route('/api/data', methods=['GET'])
def get_data():
    data = load_data()
    data["temperature"] += round(random.uniform(-0.1, 0.1), 1)
    data["humidity"] += random.randint(-1, 1)
    data["temperature"] = max(20, min(40, round(data["temperature"], 1)))
    data["humidity"] = max(30, min(90, data["humidity"]))
    
    if data["spray_status"] == "OFF" and random.random() < 0.05:
        data["pest_count"] += 1
    elif data["spray_status"] == "ON" and data["pest_count"] > 0:
        data["pest_count"] -= 1

    data["last_updated"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_data(data)
    return jsonify(data)

@app.route('/api/spray', methods=['POST'])
def control_spray():
    data = load_data()
    req_data = request.json
    status = req_data.get("status", "OFF")
    
    if data["spray_status"] != status:
        data["spray_status"] = status
        save_data(data)
        log_event(f"Spray Turned {status}")
    
    return jsonify({"message": f"Spray turned {status}", "status": status})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if email in users and users[email]["password"] == password:
        return jsonify({
            "status": "success",
            "role": users[email]["role"]
        })
    return jsonify({"status": "failed"})

@app.route('/api/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect("sensor.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT temperature, humidity, soil_moisture, timestamp
        FROM sensor_data
        ORDER BY id DESC
        LIMIT 10
    """)

    rows = cursor.fetchall()
    conn.close()

    history = []

    for row in rows:
        history.append({
            "temperature": row[0],
            "humidity": row[1],
            "soil_moisture": row[2],
            "timestamp": row[3]
        })

    return jsonify(history)

@app.route('/api/system-status')
def system_status():
    return jsonify({
        "pi_connected": True,
        "camera_status": True,
        "model_status": True
    })

@app.route('/api/pi-data')
def pi_data():
    return jsonify({"message": "Waiting for Raspberry Pi connection"})

@app.route('/api/logs')
def get_logs():
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = json.load(f)
    return jsonify(logs)

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
