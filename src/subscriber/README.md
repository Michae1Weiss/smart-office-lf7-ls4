# Flask MQTT Temperature Dashboard

A real-time dashboard application that pulls temperature, humidity, and noise level data from an MQTT broker and displays it in a web interface.

## Features

- Real-time data display for temperature, humidity, and noise level sensors
- Configurable polling intervals (1s to 1min)
- Historical data charts for each sensor
- System status monitoring
- Responsive design for desktop and mobile devices

## MQTT Message Format

The application expects MQTT messages in the following JSON formats:

### Temperature Topic: `sensors/temperature`
```json
{
  "sensor": "DHT22",
  "timestamp": "2023-04-25T14:30:00",
  "value": 23.5,
  "unit": "C"
}
```

### Humidity Topic: `sensors/humidity`
```json
{
  "sensor": "DHT22",
  "timestamp": "2023-04-25T14:30:00",
  "value": 45.2,
  "unit": "%"
}
```

### Noise Level Topic: `sensors/noise`
```json
{
  "sensor": "microphone",
  "timestamp": "2023-04-25T14:30:00",
  "value": 8,
  "unit": "count",
  "period": 10
}
```

### Status Topic: `sensors/status`
```json
{
  "status": "online",
  "timestamp": "2023-04-25T14:30:00",
  "message": "System running normally"
}
```

## Setup Instructions

### Prerequisites

- Python 3.7+
- MQTT Broker (e.g., Mosquitto)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/flask-mqtt-dashboard.git
   cd flask-mqtt-dashboard
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure MQTT connection:
   
   Open `app.py` and update the MQTT configuration variables:
   ```python
   MQTT_BROKER = "localhost"  # Change to your MQTT broker address
   MQTT_PORT = 1883
   ```

5. Run the application:
   ```
   python app.py
   ```

6. Access the dashboard:
   
   Open your browser and navigate to [http://localhost:5000](http://localhost:5000)

## Directory Structure

```
flask-mqtt-app/
├── app.py                    # Main Flask application
├── requirements.txt          # Project dependencies
├── templates/                # Jinja2 templates
│   └── index.html            # Main dashboard template
└── static/                   # Static assets
    ├── css/
    │   └── style.css         # Dashboard styling
    └── js/
        └── dashboard.js      # Dashboard JavaScript
```

## Testing

To test the application with sample MQTT messages, you can use the `mosquitto_pub` command-line tool:

```bash
# Publish a temperature reading
mosquitto_pub -t "sensors/temperature" -m '{"sensor": "DHT22", "timestamp": "2023-04-25T14:30:00", "value": 23.5, "unit": "C"}'

# Publish a humidity reading
mosquitto_pub -t "sensors/humidity" -m '{"sensor": "DHT22", "timestamp": "2023-04-25T14:30:00", "value": 45.2, "unit": "%"}'

# Publish a noise level reading
mosquitto_pub -t "sensors/noise" -m '{"sensor": "microphone", "timestamp": "2023-04-25T14:30:00", "value": 8, "unit": "count", "period": 10}'

# Publish a status message
mosquitto_pub -t "sensors/status" -m '{"status": "online", "timestamp": "2023-04-25T14:30:00", "message": "System running normally"}' -r
```

## License

MIT