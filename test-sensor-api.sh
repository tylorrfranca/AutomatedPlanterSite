#!/bin/bash

# Test script for sensor API endpoints
# Usage: ./test-sensor-api.sh

BASE_URL="${1:-http://localhost:3000}"

echo "Testing Sensor API at $BASE_URL"
echo "================================"
echo ""

# Test 1: Send sensor data (POST)
echo "1. Sending sensor data..."
curl -X POST "$BASE_URL/api/sensors" \
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
  }' \
  -w "\n\n" \
  -s

echo ""
echo "2. Retrieving latest sensor data..."
curl "$BASE_URL/api/sensors" \
  -w "\n\n" \
  -s

echo ""
echo "3. Sending another reading..."
curl -X POST "$BASE_URL/api/sensors" \
  -H "Content-Type: application/json" \
  -d '{
    "water_level": 68.2,
    "light_level": 52.1,
    "temperature": 24.1,
    "humidity": 58.3,
    "moisture": 65.7,
    "water_sensors": {
      "level_75": false,
      "level_50": true,
      "level_25": true
    }
  }' \
  -w "\n\n" \
  -s

echo ""
echo "4. Retrieving last 2 readings..."
curl "$BASE_URL/api/sensors?limit=2" \
  -w "\n\n" \
  -s

echo ""
echo "5. Testing invalid data (should fail)..."
curl -X POST "$BASE_URL/api/sensors" \
  -H "Content-Type: application/json" \
  -d '{
    "water_level": 150,
    "light_level": 45
  }' \
  -w "\n\n" \
  -s

echo ""
echo "Tests complete!"
