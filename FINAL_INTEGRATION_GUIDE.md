# Final Integration Guide - JSON File + Database

## Overview

Your website now uses a **hybrid approach** that combines the simplicity of JSON file updates with the power of a database for historical data.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RASPBERRY PI CODE                                │
│  Updates sensor_data.json every 5 seconds                           │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ Writes to file
                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│               public/sensor_data.json                               │
│  {                                                                   │
│    "moisture": 0.5,                                                 │
│    "light": 0.75,                                                   │
│    "temp": 22.24,                                                   │
│    "humidity": 50.0,                                                │
│    "waterLevel": 3                                                  │
│  }                                                                   │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ Website polls every 5 seconds
                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    WEBSITE API                                       │
│  /api/sensors                                                       │
│                                                                      │
│  1. Reads JSON file                                                 │
│  2. Checks if file was modified                                     │
│  3. If modified → Saves to database                                 │
│  4. Returns data to website                                         │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ├──────────────┬──────────────────────┐
                      │              │                      │
                      ↓              ↓                      ↓
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │   DATABASE   │  │   /pi PAGE   │  │   HISTORY    │
              │              │  │              │  │   PAGES      │
              │  Historical  │  │  Real-time   │  │              │
              │    Data      │  │   Display    │  │  Charts from │
              │              │  │              │  │   Database   │
              └──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

### 1. Pi Updates JSON File
Your friend's Pi code writes to `public/sensor_data.json`:
```json
{
  "moisture": 0.5,
  "light": 0.75,
  "temp": 22.24,
  "humidity": 50.0,
  "waterLevel": 3
}
```

### 2. Website Reads and Saves
Every time the website polls (every 5 seconds):
1. **Reads** the JSON file
2. **Checks** if file was modified (using file modification timestamp)
3. **Saves** new data to database (only if file changed)
4. **Returns** data to frontend

### 3. Website Displays
- **`/pi` page**: Shows current values from JSON file (real-time)
- **`/pi/history/[sensor]`**: Shows historical charts from database

## Benefits

✅ **Simple Pi Integration** - Just write to a JSON file  
✅ **Historical Data** - Automatically saved to database  
✅ **Real-time Display** - Instant updates on /pi page  
✅ **Data Charts** - Historical trends on history pages  
✅ **No Duplicates** - File modification tracking prevents duplicate DB entries  
✅ **Fallback** - If database fails, website still shows current data  

## JSON File Format

Your friend's Pi code should write:

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

| Field | Type | Range | Converted To |
|-------|------|-------|--------------|
| `moisture` | float | 0.0-1.0 | 0-100% |
| `light` | float | 0.0-1.0 | 0-100% |
| `temp` | float | Any | Celsius |
| `humidity` | float | 0-100 | Percentage |
| `waterLevel` | int | 0,1,3,7 | 15%, 50%, 70%, 100% |

## Database Schema

Data is automatically saved to the `sensor_readings` table:

```sql
CREATE TABLE sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  water_level REAL NOT NULL,
  light_level REAL NOT NULL,
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  moisture REAL NOT NULL,
  water_sensor_75 BOOLEAN NOT NULL DEFAULT 0,
  water_sensor_50 BOOLEAN NOT NULL DEFAULT 0,
  water_sensor_25 BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Get Current Sensor Data
```
GET /api/sensors
```
Returns the latest data from JSON file and saves to database if modified.

**Response:**
```json
{
  "water_level": 70,
  "light_level": 75,
  "temperature": 22.24,
  "humidity": 50.0,
  "moisture": 50,
  "water_sensors": {
    "level_75": false,
    "level_50": true,
    "level_25": true
  },
  "timestamp": "2024-01-15T10:30:45.123Z",
  "source": "json_file"
}
```

### Get Historical Data
```
GET /api/sensors?hours=24
```
Returns sensor readings from the database for the last N hours.

**Response:**
```json
[
  {
    "water_level": 70,
    "light_level": 75,
    "temperature": 22.24,
    "humidity": 50.0,
    "moisture": 50,
    "water_sensors": {...},
    "timestamp": "2024-01-15T10:30:45.123Z",
    "id": 123
  },
  ...
]
```

## Testing

### Test the Integration

1. **Start the website:**
   ```bash
   cd AutomatedPlanterSite
   npm run dev
   ```

2. **Run the test script:**
   ```bash
   python3 test_sensor_update.py
   ```

3. **Watch the magic:**
   - Open `/pi` page - see real-time updates
   - Check console logs - see database saves
   - Click on a sensor bar - see historical charts
   - Open database - see records accumulating

### Manual Test

Edit `public/sensor_data.json`:
```json
{
  "moisture": 0.8,
  "light": 0.3,
  "temp": 25.5,
  "humidity": 65.0,
  "waterLevel": 1
}
```

Within 5 seconds:
- `/pi` page updates
- New record in database
- Console shows: "Sensor data saved to database"

## For Your Friend

Tell your friend to:

1. **Write sensor values to the JSON file** every 5 seconds:
   ```python
   import json
   
   data = {
       'moisture': 0.5,      # 0.0-1.0
       'light': 0.75,        # 0.0-1.0
       'temp': 22.24,        # Celsius
       'humidity': 50.0,     # 0-100
       'waterLevel': 3       # 0, 1, 3, or 7
   }
   
   with open('AutomatedPlanterSite/public/sensor_data.json', 'w') as f:
       json.dump(data, f, indent=2)
   ```

2. **That's it!** The website handles everything else:
   - Reads the file
   - Saves to database
   - Displays on website
   - Creates historical charts

## Database Cleanup

The database will grow over time. To manage it:

```typescript
// Clean up old data (keep last 30 days)
sensorDb.cleanup(30);
```

Or add to a cron job to run periodically.

## Advantages of This Approach

| Feature | JSON Only | Database Only | Hybrid (Current) |
|---------|-----------|---------------|------------------|
| Simple Pi code | ✅ | ❌ | ✅ |
| Real-time display | ✅ | ⏱️ | ✅ |
| Historical data | ❌ | ✅ | ✅ |
| Charts | ❌ | ✅ | ✅ |
| Offline viewing | ✅ | ❌ | ✅ |
| Data persistence | ❌ | ✅ | ✅ |

## Troubleshooting

### Problem: Data not updating on website

**Check:**
1. Is `sensor_data.json` being updated? `ls -l public/sensor_data.json`
2. Are there any console errors in the browser?
3. Is the website running? `npm run dev`

### Problem: Database not filling up

**Check:**
1. Console logs - should show "Sensor data saved to database"
2. File modification time - website checks this before saving
3. Database file - `sqlite3 plants.db "SELECT COUNT(*) FROM sensor_readings;"`

### Problem: History pages show mock data

**Reason:** No data in database yet  
**Solution:** Wait for a few minutes while data accumulates, or run the test script

## Files Modified

- ✅ `src/app/api/sensors/route.ts` - API endpoint with JSON + database logic
- ✅ `src/app/pi/history/[sensor]/page.tsx` - History page fetches from database
- ✅ `public/sensor_data.json` - JSON file for Pi to update
- ✅ `test_sensor_update.py` - Test script to simulate Pi updates

## Summary

**Your Pi friend:** Writes simple JSON file  
**Your website:** Reads JSON + saves to database automatically  
**You get:** Real-time display + historical charts + data persistence  

**Win-win-win!** 🌱🎉

---

Everything is working now. Your friend just needs to write to the JSON file, and the website will automatically display the data AND save it to the database for historical tracking.

