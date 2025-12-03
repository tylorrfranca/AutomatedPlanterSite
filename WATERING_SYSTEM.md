# Watering System Integration Guide

This document explains how the automated watering system works with watering frequency tracking and pump control.

## Overview

The system tracks when each plant needs to be watered based on:
- **Watering frequency** (days between waterings) - set per plant in the database
- **Water amount** (mL) - set per plant in the database
- **Last watered timestamp** - automatically tracked when plant is watered
- **Pump rate** - 100 mL/min (fixed)

## Data Flow

### 1. Sensor API Response

When the Pi calls `/api/sensors?plantId=<plant_id>`, the API returns:

```json
{
  "water_level": 70,
  "light_level": 75,
  "temperature": 22.24,
  "humidity": 50,
  "moisture": 50,
  "water_sensors": { ... },
  "timestamp": "2025-12-01T21:26:21.705Z",
  "watering": {
    "watering_frequency": 7,           // Days between waterings
    "time_left_before_water": 5.2,     // Days until next watering
    "pump_duration_seconds": 180,      // How long to run the pump (calculated)
    "water_amount_ml": 300,            // Amount of water needed
    "needs_watering": false            // true if time_left <= 0
  }
}
```

### 2. Calculation Details

#### Pump Duration
```
pump_duration_seconds = (water_amount_ml / 100 mL/min) × 60 seconds/min
```

Example: If plant needs 300 mL:
- 300 mL ÷ 100 mL/min = 3 minutes
- 3 minutes × 60 = 180 seconds

#### Time Left Before Watering
```
time_left_before_water = watering_frequency_days - days_since_last_watering
```

If `time_left_before_water <= 0`, the plant needs watering (`needs_watering: true`).

### 3. Watering Workflow

#### Step 1: Check if Plant Needs Watering
The Pi should periodically check the sensor API:
```bash
curl "http://your-website-url/api/sensors?plantId=1"
```

#### Step 2: Start Pumping When Needed
If `watering.needs_watering` is `true`:
1. Run the pump for `watering.pump_duration_seconds`
2. Example: For 180 seconds, run pump for 3 minutes

#### Step 3: Mark Plant as Watered
After watering is complete, call the watering endpoint:
```bash
curl -X POST "http://your-website-url/api/plants/1/water"
```

This updates `last_watered_at` timestamp in the database.

## JSON File Structure

The `sensor_data.json` file can optionally include watering info (calculated by API):

```json
{
  "moisture": 0.5,
  "light": 0.75,
  "temp": 22.24,
  "humidity": 50.0,
  "waterLevel": 3,
  "watering_frequency": 7,
  "time_left_before_water": 5.2,
  "pump_duration_seconds": 180
}
```

**Note**: These values are typically calculated by the API based on the selected plant. The Pi can update the JSON file with these values if desired, or just read them from the API response.

## API Endpoints

### Get Sensor Data with Watering Info
```
GET /api/sensors?plantId=<plant_id>
```

Returns sensor readings plus watering information if `plantId` is provided.

### Mark Plant as Watered
```
POST /api/plants/<plant_id>/water
```

Updates `last_watered_at` timestamp for the plant.

**Response:**
```json
{
  "message": "Plant marked as watered",
  "plant": { ... },
  "last_watered_at": "2025-12-01T21:30:00.000Z"
}
```

## Getting the Selected Plant ID

The website stores the selected plant ID in `localStorage` as `selectedPlantId`. For the Pi to know which plant to monitor:

1. **Manual Configuration**: Set the plant ID in your Pi configuration
2. **API Endpoint** (future): Create an endpoint that returns the currently selected plant ID
3. **Query Parameter**: Pass the plant ID when calling the sensor API

## Example Pi Code Flow

```c
// 1. Get sensor data and watering info
GET /api/sensors?plantId=1

// 2. Check if watering is needed
if (response.watering.needs_watering == true) {
    // 3. Run pump for the calculated duration
    run_pump(response.watering.pump_duration_seconds);
    
    // 4. Mark plant as watered
    POST /api/plants/1/water
}
```

## Database Schema

The `plants` table includes:
- `watering_frequency` (INTEGER) - Days between waterings
- `water_amount` (REAL) - Amount in mL
- `last_watered_at` (DATETIME) - Last watering timestamp (nullable)

## Notes

- If a plant has never been watered (`last_watered_at` is NULL), `needs_watering` will be `true`
- The pump duration is calculated automatically based on `water_amount` and the fixed pump rate of 100 mL/min
- The API calculates `time_left_before_water` in days, rounded to 1 decimal place
- Watering information is only included in the API response if `plantId` query parameter is provided



