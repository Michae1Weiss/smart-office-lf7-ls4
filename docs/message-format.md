# MQTT Message Format Specification

This document specifies the message formats for communication between the Publisher and Subscriber components via the MQTT Broker.

## Topics

### Sensor Data Topics
- **Temperature**: `sensors/temperature`
- **Humidity**: `sensors/humidity`
- **Noise Level**: `sensors/noise`

### Status Topic
- **Status**: `sensors/status`

## Message Formats

All messages are formatted as JSON objects with specific fields for each type of data.

### Temperature Message

```json
{
  "sensor": "DHT22",        // Type of sensor (DHT11 or DHT22)
  "timestamp": "2023-04-25T14:30:00",  // ISO 8601 timestamp
  "value": 23.5,            // Temperature value
  "unit": "C"               // Unit (always Celsius)
}
```

### Humidity Message

```json
{
  "sensor": "DHT22",        // Type of sensor (DHT11 or DHT22)
  "timestamp": "2023-04-25T14:30:00",  // ISO 8601 timestamp
  "value": 45.2,            // Humidity value
  "unit": "%"               // Unit (always percent)
}
```

### Noise Level Message

```json
{
  "sensor": "microphone",   // Type of sensor
  "timestamp": "2023-04-25T14:30:00",  // ISO 8601 timestamp
  "value": 8,               // Number of noise events detected
  "unit": "count",          // Unit (count of events)
  "period": 10              // Period in seconds over which events were counted
}
```

### Status Message

```json
{
  "status": "online",       // Status (online, error, starting, shutdown)
  "timestamp": "2023-04-25T14:30:00",  // ISO 8601 timestamp
  "message": "System running normally"  // Optional human-readable message
}
```

## Error Handling

If the publisher encounters an error reading a sensor, it should:

1. Send a status message with `status` set to `"error"` and a descriptive message.
2. Continue trying to read other sensors.
3. Resume normal operation on the next cycle.

Example error status message:
```json
{
  "status": "error",
  "timestamp": "2023-04-25T14:30:05",
  "message": "Error reading temperature sensor: Check wiring"
}
```

## Timestamp Format

All timestamps should be formatted according to ISO 8601 in UTC:
- Format: `YYYY-MM-DDThh:mm:ss`
- Example: `2023-04-25T14:30:00`

## Quality of Service (QoS)

- Sensor data messages: QoS 0 (at most once delivery)
- Status messages: QoS 1 (at least once delivery)

## Retained Messages

- Sensor data messages: Not retained
- Status messages: Retained (last status is available to new subscribers)

## Implementation Notes

- The publisher should ensure data is validated before publishing.
- The subscriber should handle missing or invalid data gracefully.
- All timestamp comparisons should account for potential clock drift between devices.
