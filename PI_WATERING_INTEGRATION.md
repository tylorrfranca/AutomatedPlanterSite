# Pi Watering Integration Guide

## Overview

The website calculates **when** to water and **how long** to run the pump based on plant settings. Your Pi needs to check this information and control the pump accordingly.

## Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Every 5 Minutes                         │
│                                                             │
│  Pi Code          →  GET /api/watering?plantId=1          │
│  (C Program)      ←  Response: {needs_watering, duration}  │
│                                                             │
│  If needs_watering:                                         │
│    1. Run pump for specified duration                      │
│    2. POST /api/watering {plantId: 1}                      │
│    3. Website updates last_watered_at                      │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Check if Watering is Needed

**Endpoint:** `GET /api/watering?plantId={id}`

**Example Request:**
```bash
curl "http://localhost:3000/api/watering?plantId=1"
```

**Example Response:**
```json
{
  "plant_id": 1,
  "plant_name": "Snake Plant",
  "needs_watering": true,
  "pump_duration_seconds": 150,
  "water_amount_ml": 250,
  "time_left_days": -2.5,
  "watering_frequency_days": 14,
  "last_watered_at": "2025-11-28T10:00:00.000Z",
  "timestamp": "2025-12-03T21:00:00.000Z"
}
```

**Fields:**
- `needs_watering`: `true` if plant needs water now, `false` otherwise
- `pump_duration_seconds`: How long to run pump (calculated as: `water_amount_ml / 100 * 60`)
- `water_amount_ml`: Amount of water needed (from plant profile)
- `time_left_days`: Days until next watering (negative if overdue)

### 2. Report Watering Complete

**Endpoint:** `POST /api/watering`

**Request Body:**
```json
{
  "plantId": 1
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/watering \
  -H "Content-Type: application/json" \
  -d '{"plantId": 1}'
```

**Example Response:**
```json
{
  "success": true,
  "plant_id": 1,
  "plant_name": "Snake Plant",
  "watered_at": "2025-12-03T21:05:00.000Z",
  "next_watering_in_days": 14
}
```

## Implementation Options

### Option 1: Simple Bash Script (Quick Test)

Create `check_watering.sh`:

```bash
#!/bin/bash

PLANT_ID=1
API_URL="http://localhost:3000/api"

# Check if watering is needed
response=$(curl -s "$API_URL/watering?plantId=$PLANT_ID")
needs_watering=$(echo $response | jq -r '.needs_watering')
pump_duration=$(echo $response | jq -r '.pump_duration_seconds')

if [ "$needs_watering" = "true" ]; then
    echo "🚰 Watering needed! Running pump for $pump_duration seconds..."
    
    # TODO: Replace with actual GPIO command
    # gpio write PUMP_PIN 1
    sleep $pump_duration
    # gpio write PUMP_PIN 0
    
    # Report completion
    curl -X POST "$API_URL/watering" \
      -H "Content-Type: application/json" \
      -d "{\"plantId\": $PLANT_ID}"
    
    echo "✓ Watering complete"
else
    echo "✓ No watering needed"
fi
```

Run periodically with cron:
```bash
# Edit crontab: crontab -e
# Check every 5 minutes:
*/5 * * * * /home/pi/check_watering.sh >> /home/pi/watering.log 2>&1
```

### Option 2: Python Script

Create `watering_controller.py`:

```python
#!/usr/bin/env python3

import requests
import time
import RPi.GPIO as GPIO

# Configuration
API_URL = "http://localhost:3000/api"
PLANT_ID = 1
PUMP_PIN = 17  # GPIO pin for pump relay
CHECK_INTERVAL = 300  # Check every 5 minutes

def setup_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PUMP_PIN, GPIO.OUT)
    GPIO.output(PUMP_PIN, GPIO.LOW)

def check_watering():
    try:
        response = requests.get(f"{API_URL}/watering?plantId={PLANT_ID}")
        data = response.json()
        return data['needs_watering'], data['pump_duration_seconds']
    except Exception as e:
        print(f"Error checking watering: {e}")
        return False, 0

def run_pump(duration):
    print(f"Starting pump for {duration} seconds...")
    GPIO.output(PUMP_PIN, GPIO.HIGH)
    time.sleep(duration)
    GPIO.output(PUMP_PIN, GPIO.LOW)
    print("Pump stopped")

def report_watering():
    try:
        response = requests.post(
            f"{API_URL}/watering",
            json={"plantId": PLANT_ID}
        )
        print("Watering logged successfully")
        return True
    except Exception as e:
        print(f"Error reporting watering: {e}")
        return False

def main():
    setup_gpio()
    print(f"Watering controller started (Plant ID: {PLANT_ID})")
    
    try:
        while True:
            needs_watering, pump_duration = check_watering()
            
            if needs_watering:
                print("🚰 Watering needed!")
                run_pump(pump_duration)
                report_watering()
            else:
                print("✓ No watering needed")
            
            print(f"Waiting {CHECK_INTERVAL} seconds...\n")
            time.sleep(CHECK_INTERVAL)
    
    except KeyboardInterrupt:
        print("\nShutting down...")
        GPIO.cleanup()

if __name__ == "__main__":
    main()
```

Run with:
```bash
chmod +x watering_controller.py
python3 watering_controller.py
```

### Option 3: Integrate with Existing C Code

See the `watering_integration.c` file for a complete C implementation.

Key functions to add to your code:
1. `check_watering_needed()` - Calls API to check status
2. `run_pump()` - Controls GPIO to run pump
3. `report_watering_complete()` - Notifies website when done

## Testing

### 1. Test the API (without Pi)

```bash
# Check watering status
curl "http://localhost:3000/api/watering?plantId=1"

# Manually mark as watered
curl -X POST http://localhost:3000/api/watering \
  -H "Content-Type: application/json" \
  -d '{"plantId": 1}'
```

### 2. Test with Mock Pump

Run the Python script without GPIO:
- Comment out GPIO lines
- Replace `run_pump()` with `time.sleep(duration)`
- Verify API calls work correctly

### 3. Full Integration Test

1. Set plant to need watering (in database or via website)
2. Run your watering controller
3. Verify pump activates for correct duration
4. Check website updates "Time to Water" bar
5. Verify countdown resets

## Timing Recommendations

- **Check interval:** Every 5-10 minutes
- **Why not more frequent?** 
  - Watering frequency is in days, not minutes
  - Reduces API calls and server load
  - Prevents accidental double-watering

## Error Handling

Your code should handle:
- ✅ Network failures (API unreachable)
- ✅ Invalid responses (malformed JSON)
- ✅ Pump failures (GPIO errors)
- ✅ Multiple plants (loop through plant IDs)

## Security Note

If your Pi is exposed to the internet:
- Consider adding API authentication
- Use HTTPS instead of HTTP
- Limit API rate to prevent abuse

## Troubleshooting

**Problem:** API returns 404
- **Solution:** Check that plantId exists in database

**Problem:** `needs_watering` always `false`
- **Solution:** Check `last_watered_at` in database is correct

**Problem:** Pump doesn't run
- **Solution:** Verify GPIO pin number and wiring

**Problem:** Watering doesn't get logged
- **Solution:** Check POST request format and network

## Next Steps

1. ✅ Create API endpoint (`/api/watering`) - DONE
2. ⬜ Test API with curl
3. ⬜ Choose implementation (Bash/Python/C)
4. ⬜ Wire pump to GPIO
5. ⬜ Test pump control manually
6. ⬜ Integrate with sensor code
7. ⬜ Test end-to-end system

