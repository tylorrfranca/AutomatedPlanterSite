# Raspberry Pi Sensor Integration Guide

This guide explains how to connect your Raspberry Pi sensors to the Automated Planter website.

## API Endpoints

### POST /api/sensors - Send Sensor Data

The Raspberry Pi should POST sensor readings to this endpoint.

**Endpoint:** `http://your-domain:3000/api/sensors`

**Method:** POST

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "water_level": 75.5,
  "light_level": 45.2,
  "temperature": 23.5,
  "humidity": 55.8,
  "moisture": 62.3,
  "water_sensors": {
    "level_75": true,
    "level_50": true,
    "level_25": true
  }
}
```

**Field Descriptions:**
- `water_level`: Water level percentage (0-100)
- `light_level`: Light intensity percentage (0-100)
- `temperature`: Temperature in Celsius
- `humidity`: Humidity percentage (0-100)
- `moisture`: Soil moisture percentage (0-100)
- `water_sensors`: Object containing boolean values for water level sensors
  - `level_75`: Sensor at 75% mark (true = water detected)
  - `level_50`: Sensor at 50% mark (true = water detected)
  - `level_25`: Sensor at 25% mark (true = water detected)

**Response (Success):**
```json
{
  "success": true,
  "id": 123,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Sensor data saved successfully"
}
```

**Response (Error):**
```json
{
  "error": "Missing required fields: water_level, temperature"
}
```

### GET /api/sensors - Retrieve Sensor Data

**Endpoint:** `http://your-domain:3000/api/sensors`

**Method:** GET

**Query Parameters (Optional):**
- `limit`: Number of recent readings to retrieve (e.g., `?limit=10`)
- `hours`: Get readings from last N hours (e.g., `?hours=24`)

**Response:**
```json
{
  "water_level": 75.5,
  "light_level": 45.2,
  "temperature": 23.5,
  "humidity": 55.8,
  "moisture": 62.3,
  "water_sensors": {
    "level_75": true,
    "level_50": true,
    "level_25": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "id": 123
}
```

## Example Python Code for Raspberry Pi

```python
import requests
import json
import time

# Configuration
API_URL = "http://localhost:3000/api/sensors"  # Change to your server IP
UPDATE_INTERVAL = 5  # seconds

def read_sensors():
    """Read values from your sensors here"""
    # Replace with actual sensor reading code
    return {
        "water_level": 75.5,
        "light_level": 45.2,
        "temperature": 23.5,
        "humidity": 55.8,
        "moisture": 62.3,
        "water_sensors": {
            "level_75": True,
            "level_50": True,
            "level_25": True
        }
    }

def send_sensor_data(data):
    """Send sensor data to the website"""
    try:
        response = requests.post(
            API_URL,
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 201:
            print(f"✓ Data sent successfully: {response.json()}")
            return True
        else:
            print(f"✗ Error: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Connection error: {e}")
        return False

def main():
    """Main loop"""
    print("Starting sensor data transmission...")
    print(f"Target: {API_URL}")
    print(f"Update interval: {UPDATE_INTERVAL}s\n")
    
    while True:
        try:
            # Read sensors
            sensor_data = read_sensors()
            print(f"Reading sensors: {sensor_data}")
            
            # Send to server
            success = send_sensor_data(sensor_data)
            
            if not success:
                print("Retrying in 10 seconds...")
                time.sleep(10)
            else:
                time.sleep(UPDATE_INTERVAL)
                
        except KeyboardInterrupt:
            print("\nStopping...")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
```

## Example using cURL

Test the API endpoint from your Raspberry Pi terminal:

```bash
# Send sensor data
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "water_level": 75.5,
    "light_level": 45.2,
    "temperature": 23.5,
    "humidity": 55.8,
    "moisture": 62.3,
    "water_sensors": {
      "level_75": true,
      "level_50": true,
      "level_25": true
    }
  }'

# Retrieve latest sensor data
curl http://localhost:3000/api/sensors

# Retrieve last 10 readings
curl http://localhost:3000/api/sensors?limit=10

# Retrieve readings from last 24 hours
curl http://localhost:3000/api/sensors?hours=24
```

## Setting Up on Raspberry Pi

1. **Install Python dependencies:**
   ```bash
   pip3 install requests
   ```

2. **Update the API URL** in your Python script to match your server:
   - For local network: `http://192.168.1.XXX:3000/api/sensors`
   - For localhost: `http://localhost:3000/api/sensors`

3. **Run your sensor script:**
   ```bash
   python3 send_sensor_data.py
   ```

## Data Validation

The API validates all incoming data:

- **water_level**: Must be 0-100
- **light_level**: Must be 0-100
- **temperature**: Any numeric value (in Celsius)
- **humidity**: Must be 0-100
- **moisture**: Must be 0-100
- **water_sensors**: Boolean values for each level

Invalid data will return a 400 error with a descriptive message.

## Database Storage

All sensor readings are automatically stored in SQLite database (`plants.db`) in the `sensor_readings` table with timestamps. The website will:

- Display the latest readings on the `/pi` page
- Store historical data automatically
- Keep data for 30 days by default (configurable)

## Troubleshooting

### Connection Refused
- Make sure the Next.js server is running on the target machine
- Check if port 3000 is accessible from the Raspberry Pi
- Verify the IP address is correct

### Data Not Displaying
- Check browser console for errors
- Verify data was saved: `curl http://localhost:3000/api/sensors`
- Check server logs for errors

### Authentication (if needed in future)
Currently, the API is open. If you need to add authentication, you can modify the POST endpoint to accept an API key.

## Next Steps

1. Integrate your actual sensor reading code into the `read_sensors()` function
2. Set up a systemd service to auto-start the sensor script on boot
3. Configure your network settings for reliable connectivity
4. Monitor the `/pi` page to verify data is being received
