from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime
import json
import os
import random
from random import randint

app = Flask(__name__, static_folder='..', static_url_path='')

# CORS: allow all origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/')
def index():
    """Serve the landing page."""
    return app.send_static_file('index.html')

# ─────────────────────────────────────────
# Paths (always relative to this file)
# ─────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DB_FILE    = os.path.join(BASE_DIR, 'sensor.db')
DATA_FILE  = os.path.join(BASE_DIR, 'data.json')
LOG_FILE   = os.path.join(BASE_DIR, 'logs.json')

# ─────────────────────────────────────────
# In-memory user store (add signup users here)
# ─────────────────────────────────────────
users = {
    "admin@gmail.com":  {"password": "1234", "role": "admin"},
    "farmer@gmail.com": {"password": "1234", "role": "farmer"},
}

# ─────────────────────────────────────────
# Database init
# ─────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature   REAL,
            humidity      REAL,
            soil_moisture REAL,
            timestamp     TEXT
        )
    """)
    conn.commit()
    conn.close()

# ─────────────────────────────────────────
# Data helpers
# ─────────────────────────────────────────
def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                if "soil_moisture" not in data:
                    data["soil_moisture"] = 45.0
                return data
        except Exception:
            pass
    return {
        "temperature": 28.0,
        "humidity":    65,
        "pest_count":  3,
        "spray_status": "OFF",
        "crop_health": "Good",
        "soil_moisture": 45,
        "last_updated": ""
    }

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def append_log(level, message):
    """Append a structured log entry to logs.json (frontend-compatible format)."""
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                logs = json.load(f)
        except Exception:
            logs = []
    logs.insert(0, {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "level":     level,
        "message":   message
    })
    with open(LOG_FILE, 'w') as f:
        json.dump(logs[:200], f, indent=2)

# ─────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────

@app.route('/api/sensor-data', methods=['GET'])
def sensor_data():
    """Return a fresh random sensor reading and persist it to SQLite."""
    temperature   = round(random.uniform(20, 35), 1)
    humidity      = round(random.uniform(40, 80), 1)
    soil_moisture = round(random.uniform(30, 70), 1)
    timestamp     = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        conn   = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sensor_data (temperature, humidity, soil_moisture, timestamp) VALUES (?, ?, ?, ?)",
            (temperature, humidity, soil_moisture, timestamp)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB ERROR] sensor-data insert: {e}")

    return jsonify({
        "temperature":   temperature,
        "humidity":      humidity,
        "soil_moisture": soil_moisture,
        "timestamp":     timestamp
    })


@app.route('/api/history', methods=['GET'])
def get_history():
    """Return the last 20 sensor readings from SQLite."""
    try:
        conn   = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT temperature, humidity, soil_moisture, timestamp
            FROM sensor_data
            ORDER BY id DESC
            LIMIT 20
        """)
        rows = cursor.fetchall()
        conn.close()
        history = [
            {"temperature": r[0], "humidity": r[1], "soil_moisture": r[2], "timestamp": r[3]}
            for r in rows
        ]
        return jsonify(history)
    except Exception as e:
        print(f"[DB ERROR] history: {e}")
        return jsonify([])


@app.route('/api/data', methods=['GET'])
def get_data():
    """Return dashboard summary data (pest count, spray status, crop health)."""
    data = load_data()
    data["temperature"] = round(data["temperature"] + random.uniform(-0.2, 0.2), 1)
    data["humidity"]    = int(data["humidity"]) + random.randint(-1, 1)
    data["temperature"] = max(20, min(40, data["temperature"]))
    data["humidity"]    = max(30, min(90, data["humidity"]))
    data["soil_moisture"] = max(10, min(100, data["soil_moisture"] + random.uniform(-0.5, 0.5)))

    if data["spray_status"] == "OFF" and random.random() < 0.05:
        data["pest_count"] += 1
    elif data["spray_status"] == "ON" and data["pest_count"] > 0:
        data["pest_count"] -= 1

    data["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_data(data)
    return jsonify(data)


@app.route('/api/spray', methods=['POST'])
def control_spray():
    """Toggle the spray system ON or OFF."""
    req  = request.get_json(force=True, silent=True) or {}
    status = req.get("status", "OFF")
    data = load_data()
    if data["spray_status"] != status:
        data["spray_status"] = status
        save_data(data)
        append_log("INFO", f"Spray system turned {status}")
    return jsonify({"message": f"Spray turned {status}", "status": status})


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate a user by email and password."""
    req      = request.get_json(force=True, silent=True) or {}
    email    = req.get("email", "").strip().lower()
    password = req.get("password", "")
    if email in users and users[email]["password"] == password:
        append_log("SUCCESS", f"User logged in: {email}")
        return jsonify({"status": "success", "role": users[email]["role"]})
    return jsonify({"status": "failed", "message": "Invalid credentials"})


@app.route('/api/signup', methods=['POST'])
def signup():
    """Register a new user (in-memory for this session)."""
    req      = request.get_json(force=True, silent=True) or {}
    email    = req.get("email", "").strip().lower()
    password = req.get("password", "")
    role     = req.get("role", "farmer")
    if not email or not password:
        return jsonify({"status": "failed", "message": "Email and password are required"})
    if email in users:
        return jsonify({"status": "failed", "message": "User already exists"})
    users[email] = {"password": password, "role": role}
    append_log("INFO", f"New user registered: {email} ({role})")
    return jsonify({"status": "success", "role": role})


@app.route('/api/system-status', methods=['GET'])
def system_status():
    """Return a simple system health check."""
    return jsonify({
        "pi_connected":   True,
        "camera_status":  True,
        "model_status":   True,
        "backend_status": "online"
    })


@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Return all stored system logs."""
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                logs = json.load(f)
        except Exception:
            logs = []
    # Seed with startup message if empty
    if not logs:
        logs = [{
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "level":     "INFO",
            "message":   "AgroVision backend started successfully"
        }]
    return jsonify(logs)


@app.route('/api/pi-data', methods=['GET'])
def pi_data():
    return jsonify({"message": "Waiting for Raspberry Pi connection"})


# ─────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    append_log("INFO", "AgroVision backend initialized")
    print("✅  AgroVision Backend running at http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
