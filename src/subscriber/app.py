# app.py
from flask import Flask, render_template, jsonify
import paho.mqtt.client as mqtt
import json
import threading
import time
from datetime import datetime

app = Flask(__name__, static_url_path='/static')

# Configuration
MQTT_BROKER = "localhost"  # Change to your MQTT broker address
MQTT_PORT = 1883
MQTT_TOPICS = ["sensors/temperature", "sensors/humidity", "sensors/noise", "sensors/status"]

# Global variables to store the latest data
sensor_data = {
    "temperature": {"sensor": "", "timestamp": "", "value": 0, "unit": "C"},
    "humidity": {"sensor": "", "timestamp": "", "value": 0, "unit": "%"},
    "noise": {"sensor": "", "timestamp": "", "value": 0, "unit": "count", "period": 0},
    "status": {"status": "offline", "timestamp": "", "message": "Not connected"}
}

# MQTT client setup
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # Subscribe to the topics
    for topic in MQTT_TOPICS:
        client.subscribe(topic)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        topic = msg.topic
        
        if topic == "sensors/temperature":
            sensor_data["temperature"] = payload
        elif topic == "sensors/humidity":
            sensor_data["humidity"] = payload
        elif topic == "sensors/noise":
            sensor_data["noise"] = payload
        elif topic == "sensors/status":
            sensor_data["status"] = payload
            
        print(f"Received message on {topic}: {payload}")
    except Exception as e:
        print(f"Error processing message: {e}")

# Initialize MQTT client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker in a separate thread
def mqtt_connect():
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"Failed to connect to MQTT broker: {e}")
        # Set status to offline
        now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        sensor_data["status"] = {
            "status": "offline",
            "timestamp": now,
            "message": f"Failed to connect: {str(e)}"
        }
        # Try reconnecting after a delay
        time.sleep(10)
        mqtt_connect()

# Start the MQTT client in a background thread
mqtt_thread = threading.Thread(target=mqtt_connect, daemon=True)
mqtt_thread.start()

# Flask routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(sensor_data)

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8000)