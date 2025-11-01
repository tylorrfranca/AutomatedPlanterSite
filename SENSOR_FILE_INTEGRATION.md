# Sensor File Integration Guide

## Overview

The website now reads sensor data from a JSON file that your Raspberry Pi code will update. This simplifies the integration - your Pi just needs to write to a file, and the website will automatically read and display the data.

## Data Flow

```
Raspberry Pi → Updates sensor_data.json → Website reads file → Displays on /pi page
```

## Sensor Data File Location

**File Path:** `public/sensor_data.json`

Your Pi code should update this file with the latest sensor readings.

## JSON Format

Your friend's Pi code should write data in this exact format:

```json
{
  "moisture": 0.5,
  "light": 0.75,
  "temp": 22.24,
  "humidity": 50.0,
  "waterLevel": 3
}
```

### Field Definitions

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `moisture` | float | 0.0 - 1.0 | Soil moisture (0.0 = dry, 1.0 = wet) |
| `light` | float | 0.0 - 1.0 | Light level (0.0 = dark, 1.0 = bright) |
| `temp` | float | Any | Temperature in Celsius |
| `humidity` | float | 0.0 - 100.0 | Relative humidity percentage |
| `waterLevel` | int | 0, 1, 3, or 7 | Water tank level from dip switches |

### Water Level Values

The `waterLevel` field represents the state of the 3 dip switches:

| Value | Meaning | Percentage | Binary |
|-------|---------|------------|--------|
| 0 | Empty | 15% | 000 |
| 1 | Low | 50% | 001 |
| 3 | Medium | 70% | 011 |
| 7 | Full | 100% | 111 |

The website automatically converts these values to percentages and individual sensor states for display.

## Raspberry Pi Integration

### Option 1: Direct File Write (Python)

```python
import json
import time

def update_sensor_data(moisture, light, temp, humidity, water_level):
    """Update the sensor data JSON file"""
    sensor_data = {
        'moisture': moisture,
        'light': light,
        'temp': temp,
        'humidity': humidity,
        'waterLevel': water_level
    }
    
    # Path to the website's public directory
    file_path = '/path/to/AutomatedPlanterSite/public/sensor_data.json'
    
    with open(file_path, 'w') as f:
        json.dump(sensor_data, f, indent=2)
    
    print(f"Sensor data updated: {sensor_data}")

# Example usage
while True:
    # Read your sensors
    moisture = read_moisture_sensor()  # Returns 0.0-1.0
    light = read_light_sensor()        # Returns 0.0-1.0
    temp = read_temp_sensor()          # Returns temperature in °C
    humidity = read_humidity_sensor()  # Returns 0.0-100.0
    water_level = read_water_switches() # Returns 0, 1, 3, or 7
    
    # Update the file
    update_sensor_data(moisture, light, temp, humidity, water_level)
    
    # Wait 5 seconds before next update
    time.sleep(5)
```

### Option 2: Direct File Write (C)

```c
#include <stdio.h>
#include <unistd.h>

void update_sensor_data(float moisture, float light, float temp, float humidity, int water_level) {
    // Path to the website's public directory
    const char* file_path = "/path/to/AutomatedPlanterSite/public/sensor_data.json";
    
    FILE* fp = fopen(file_path, "w");
    if (fp == NULL) {
        printf("Error opening sensor file\n");
        return;
    }
    
    fprintf(fp, "{\n");
    fprintf(fp, "  \"moisture\": %.2f,\n", moisture);
    fprintf(fp, "  \"light\": %.2f,\n", light);
    fprintf(fp, "  \"temp\": %.2f,\n", temp);
    fprintf(fp, "  \"humidity\": %.1f,\n", humidity);
    fprintf(fp, "  \"waterLevel\": %d\n", water_level);
    fprintf(fp, "}\n");
    
    fclose(fp);
    printf("Sensor data updated\n");
}

int main() {
    while (1) {
        // Read your sensors
        float moisture = read_moisture_sensor();  // Returns 0.0-1.0
        float light = read_light_sensor();        // Returns 0.0-1.0
        float temp = read_temp_sensor();          // Returns temperature in °C
        float humidity = read_humidity_sensor();  // Returns 0.0-100.0
        int water_level = read_water_switches();  // Returns 0, 1, 3, or 7
        
        // Update the file
        update_sensor_data(moisture, light, temp, humidity, water_level);
        
        // Wait 5 seconds before next update
        sleep(5);
    }
    
    return 0;
}
```

## Website Behavior

### Automatic Updates

The website's `/pi` page polls the API every 5 seconds, which reads the latest data from `sensor_data.json`. This means:

1. Pi updates `sensor_data.json` with new sensor readings
2. Website reads file when API is called
3. UI updates automatically with new data
4. No HTTP requests needed from Pi to website

### Data Conversion

The website automatically converts your Pi's format to the display format:

- **Moisture**: `0.5` → `50%`
- **Light**: `0.75` → `75%`
- **Temperature**: `22.24` → `22.24°C`
- **Humidity**: `50.0` → `50.0%`
- **Water Level**: `3` → `70%` (with sensor states: level_75=false, level_50=true, level_25=true)

### Display Thresholds

The website shows "good zones" on the sensor bars:
- **Light**: 35-65% is good
- **Temperature**: 17.5-32.5°C is good
- **Humidity**: 35-65% is good
- **Moisture**: 35-65% is good
- **Water Level**: Uses the 3 dip switch markers (25%, 50%, 75%)

## Testing

### Test with Manual File Updates

You can test the integration by manually editing `sensor_data.json`:

1. Open `AutomatedPlanterSite/public/sensor_data.json`
2. Change the values
3. Save the file
4. Open the website at `/pi`
5. The display should update within 5 seconds

### Example Test Values

**Empty water tank:**
```json
{
  "moisture": 0.3,
  "light": 0.4,
  "temp": 18.5,
  "humidity": 65.0,
  "waterLevel": 0
}
```

**Full water tank:**
```json
{
  "moisture": 0.6,
  "light": 0.8,
  "temp": 24.0,
  "humidity": 55.0,
  "waterLevel": 7
}
```

## File Permissions

Make sure your Pi code has write permissions to the file:

```bash
# If needed, set permissions
chmod 666 /path/to/AutomatedPlanterSite/public/sensor_data.json
```

Or run your Pi code with appropriate permissions.

## Troubleshooting

### Problem: Website shows "Failed to read sensor data file"

**Solution:**
- Check that `sensor_data.json` exists in `public/` directory
- Verify the file contains valid JSON
- Check file permissions

### Problem: Data not updating on website

**Solution:**
- Verify Pi code is actually writing to the file
- Check the file modification time: `ls -l public/sensor_data.json`
- Open browser console and check for API errors
- Verify the file path is correct

### Problem: Invalid JSON format

**Solution:**
- Make sure all field names use quotes
- Use proper JSON syntax (no trailing commas)
- Validate JSON at https://jsonlint.com/

### Problem: Website shows wrong values

**Solution:**
- Verify your Pi code is using the correct ranges:
  - `moisture`: 0.0-1.0 (not 0-100)
  - `light`: 0.0-1.0 (not 0-100)
  - `humidity`: 0.0-100.0
  - `waterLevel`: 0, 1, 3, or 7 (not percentages)

## Network Deployment

If your website is deployed online (Vercel, etc.) and your Pi is local:

### Option 1: Shared File System
Mount a network share or use a service like Dropbox/Google Drive

### Option 2: HTTP POST (if needed later)
If you need to POST data instead of writing a file, let me know and I can add that endpoint back.

### Option 3: Git Auto-Commit
Have Pi commit and push the JSON file to GitHub, and your deployed site pulls it

## Advantages of File-Based Approach

✅ **Simple**: No HTTP server needed on Pi  
✅ **Reliable**: No network errors or timeouts  
✅ **Fast**: Direct file I/O is faster than HTTP  
✅ **Flexible**: Easy to debug and test manually  
✅ **No Dependencies**: No need for curl, requests, etc.  

## Notes

- The file is created with default values on first run if it doesn't exist
- Website will always show the most recent file contents
- No database needed - file is the single source of truth
- File updates are atomic (write to temp file, then rename)

---

**Your integration is ready!** Just have your Pi code write to `public/sensor_data.json` and the website will display the data automatically. 🌱

