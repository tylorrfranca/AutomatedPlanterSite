#!/bin/bash

# Test script for Watering API
# This demonstrates how the Pi will communicate with the website

API_URL="http://localhost:3000/api/watering"
PLANT_ID=8  # Aloe Vera for testing

echo "======================================"
echo " Testing Watering API Integration"
echo "======================================"
echo ""

# Test 1: Check if watering is needed
echo "1. Checking if plant needs watering..."
echo "   GET $API_URL?plantId=$PLANT_ID"
echo ""

RESPONSE=$(curl -s "$API_URL?plantId=$PLANT_ID")
echo "$RESPONSE" | python3 -m json.tool

# Parse the response
NEEDS_WATERING=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['needs_watering'])")
PUMP_DURATION=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['pump_duration_seconds'])")
PLANT_NAME=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['plant_name'])")

echo ""
echo "------------------------------------"
echo "Plant: $PLANT_NAME"
echo "Needs watering: $NEEDS_WATERING"
echo "Pump duration: $PUMP_DURATION seconds"
echo "------------------------------------"
echo ""

# Test 2: Simulate watering (if needed)
if [ "$NEEDS_WATERING" = "True" ] || [ "$NEEDS_WATERING" = "true" ]; then
    echo "2. Plant needs water! Simulating pump activation..."
    echo "   [Pump would run for $PUMP_DURATION seconds]"
    echo ""
    
    echo "3. Marking plant as watered..."
    echo "   POST $API_URL"
    echo "   Body: {\"plantId\": $PLANT_ID}"
    echo ""
    
    WATER_RESPONSE=$(curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "{\"plantId\": $PLANT_ID}")
    
    echo "$WATER_RESPONSE" | python3 -m json.tool
    echo ""
    echo "✓ Plant marked as watered!"
    echo ""
    
    # Check again to verify reset
    echo "4. Checking status after watering..."
    RESPONSE2=$(curl -s "$API_URL?plantId=$PLANT_ID")
    echo "$RESPONSE2" | python3 -m json.tool
    echo ""
    
else
    echo "2. ✓ Plant doesn't need watering yet"
    TIME_LEFT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['time_left_days'])")
    echo "   Time left: $TIME_LEFT days"
    echo ""
fi

echo "======================================"
echo " Test Complete!"
echo "======================================"

