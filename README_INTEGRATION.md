# Automated Planter - Sensor Integration Guide

## 📋 Quick Overview

Your website reads sensor data from a **JSON file** that your Raspberry Pi updates. The website automatically saves this data to a database for historical tracking and displays it in real-time.

---

## 🚀 How It Works

```
┌──────────────────┐
│  Raspberry Pi    │  Writes sensor data every 5 seconds
│  (Your Friend's  │
│     Code)        │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  public/sensor_data.json             │
│  {                                   │
│    "moisture": 0.5,                  │
│    "light": 0.75,                    │
│    "temp": 22.24,                    │
│    "humidity": 50.0,                 │
│    "waterLevel": 3                   │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Website API (/api/sensors)          │
│  • Reads JSON file every 5 seconds  │
│  • Auto-saves to database            │
│  • Returns data to frontend          │
└────────┬─────────────────────────────┘
         │
         ├─────────────┬────────────────┐
         ↓             ↓                ↓
    ┌────────┐   ┌─────────┐    ┌──────────┐
    │Database│   │/pi Page │    │ History  │
    │        │   │Real-time│    │  Pages   │
    └────────┘   └─────────┘    └──────────┘
```

---

## 📝 JSON File Format

**Location:** `public/sensor_data.json`

Your friend's Raspberry Pi code should write this exact format:

```json
{
  "moisture": 0.5,
  "light": 0.75,
  "temp": 22.24,
  "humidity": 50.0,
  "waterLevel": 3
}
```

### Field Specifications

| Field | Type | Range | Website Converts To |
|-------|------|-------|---------------------|
| `moisture` | float | **0.0 - 1.0** | 0-100% (multiply by 100) |
| `light` | float | **0.0 - 1.0** | 0-100% (multiply by 100) |
| `temp` | float | Any °C | Celsius (no conversion) |
| `humidity` | float | 0 - 100 | Percentage (no conversion) |
| `waterLevel` | int | **0, 1, 3, or 7** | 15%, 50%, 70%, 100% |

### ⚠️ Important: Water Level Values

The 3 dip switches create these values:

| Value | Binary | Meaning | Percentage |
|-------|--------|---------|------------|
| 0 | 000 | All switches OFF | 15% (empty) |
| 1 | 001 | Only 25% switch ON | 50% (low) |
| 3 | 011 | 25% + 50% switches ON | 70% (medium) |
| 7 | 111 | All switches ON | 100% (full) |

---

## 💻 Code Examples for Your Friend

### Python Example

```python
import json
import time

def update_sensor_file(moisture, light, temp, humidity, water_level):
    """Write sensor data to JSON file"""
    data = {
        'moisture': moisture,      # 0.0-1.0
        'light': light,            # 0.0-1.0
        'temp': temp,              # Celsius
        'humidity': humidity,      # 0-100
        'waterLevel': water_level  # 0, 1, 3, or 7
    }
    
    with open('AutomatedPlanterSite/public/sensor_data.json', 'w') as f:
        json.dump(data, f, indent=2)

# Main loop - run every 5 seconds
while True:
    # Read your sensors here
    moisture = read_moisture_sensor()    # Returns 0.0-1.0
    light = read_light_sensor()          # Returns 0.0-1.0
    temp = read_temperature_sensor()     # Returns °C
    humidity = read_humidity_sensor()    # Returns 0-100
    water_level = read_dip_switches()    # Returns 0, 1, 3, or 7
    
    # Update the file
    update_sensor_file(moisture, light, temp, humidity, water_level)
    
    time.sleep(5)
```

### C Example

```c
#include <stdio.h>
#include <unistd.h>

void update_sensor_file(float moisture, float light, float temp, 
                       float humidity, int water_level) {
    FILE* f = fopen("AutomatedPlanterSite/public/sensor_data.json", "w");
    if (!f) return;
    
    fprintf(f, "{\n");
    fprintf(f, "  \"moisture\": %.2f,\n", moisture);
    fprintf(f, "  \"light\": %.2f,\n", light);
    fprintf(f, "  \"temp\": %.2f,\n", temp);
    fprintf(f, "  \"humidity\": %.1f,\n", humidity);
    fprintf(f, "  \"waterLevel\": %d\n", water_level);
    fprintf(f, "}\n");
    
    fclose(f);
}

int main() {
    while(1) {
        // Read your sensors
        float moisture = read_moisture_sensor();    // 0.0-1.0
        float light = read_light_sensor();          // 0.0-1.0
        float temp = read_temperature_sensor();     // °C
        float humidity = read_humidity_sensor();    // 0-100
        int water_level = read_dip_switches();      // 0, 1, 3, or 7
        
        // Update the file
        update_sensor_file(moisture, light, temp, humidity, water_level);
        
        sleep(5);
    }
}
```

---

## 🧪 Testing

### 1. Test with Mock Data

Run the included test script:

```bash
cd AutomatedPlanterSite
python3 test_sensor_update.py
```

This simulates Pi updates and you can watch values change on `/pi` page.

### 2. Manual Test

Edit `public/sensor_data.json` manually:

```json
{
  "moisture": 0.8,
  "light": 0.3,
  "temp": 25.5,
  "humidity": 65.0,
  "waterLevel": 1
}
```

Save and refresh `/pi` page - values should update within 5 seconds.

### 3. Verify Database Saving

Check the console output when website is running - you should see:
```
Sensor data saved to database: { id: 123, timestamp: '...', source: 'json_file' }
```

---

## 📊 What Gets Displayed

### `/pi` Page (Real-Time)
- Bar graphs for all 5 sensors
- Current values update every 5 seconds
- Visual threshold markers
- Water level warnings when low

### `/pi/history/[sensor]` Pages (Historical)
- Line charts from database
- Time ranges: 1h, 6h, 24h, 48h, 7 days
- Statistics: Current, Average, Min, Max
- Click any sensor bar to view history

---

## ⚙️ Website Configuration

### API Endpoint
```
GET /api/sensors          → Returns latest from JSON file
GET /api/sensors?hours=24 → Returns historical data from database
```

### Polling Interval
Website polls every **5 seconds** (configurable in `src/app/pi/page.tsx` line 263)

### Database
- SQLite (`plants.db`)
- Table: `sensor_readings`
- Auto-saves when JSON file is modified
- No duplicate entries (tracks file modification time)

---

## 🔧 Common Issues

### Problem: Values not updating on website

**Check:**
1. Is `sensor_data.json` being updated?
   ```bash
   ls -l AutomatedPlanterSite/public/sensor_data.json
   ```
2. Is website running?
   ```bash
   cd AutomatedPlanterSite && npm run dev
   ```
3. Browser console for errors (F12)

### Problem: Database not filling up

**Check:**
1. Server console - should show "Sensor data saved to database"
2. File is being modified (website checks modification time)
3. Database file exists: `ls -l plants.db`

### Problem: Wrong values displayed

**Verify:**
- `moisture` and `light` are 0.0-1.0 (NOT 0-100)
- `waterLevel` is 0, 1, 3, or 7 (NOT percentages)
- `humidity` is 0-100

---

## 📁 Relevant Files

**Your Friend Needs:**
- `PI_CODE_INSTRUCTIONS.txt` - Quick reference
- `SENSOR_FILE_INTEGRATION.md` - Detailed docs

**You Need:**
- `FINAL_INTEGRATION_GUIDE.md` - Technical details
- `SETUP_COMPLETE.md` - Overview

**For Testing:**
- `test_sensor_update.py` - Simulates Pi updates
- `public/sensor_data.json` - The data file

---

## ✅ Benefits

| Feature | ✓ |
|---------|---|
| Simple Pi code (just write to file) | ✅ |
| Automatic database saving | ✅ |
| Real-time website updates | ✅ |
| Historical data charts | ✅ |
| No HTTP requests needed from Pi | ✅ |
| Works offline | ✅ |
| No duplicate database entries | ✅ |

---

## 🎯 Summary

1. **Pi writes** to `sensor_data.json` every 5 seconds
2. **Website reads** file automatically
3. **Database saves** data when file changes
4. **Frontend displays** real-time and historical data

**That's it!** Simple file updates, automatic everything else. 🌱

---

## 📞 Need Help?

- Check `PI_CODE_INSTRUCTIONS.txt` for quick Pi reference
- See `FINAL_INTEGRATION_GUIDE.md` for technical details
- Run `test_sensor_update.py` to verify system works

