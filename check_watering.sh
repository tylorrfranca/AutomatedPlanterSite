#!/bin/bash

PLANT_ID=1
API_URL="http://localhost:3000/api"

# Check if watering is needed
response=$(curl -s "$API_URL/watering?plantId=$PLANT_ID")
needs_watering=$(echo $response | jq -r '.needs_watering')
pump_duration=$(echo $response | jq -r '.pump_duration_seconds')

if [ "$needs_watering" = "true" ]; then
    echo "Watering needed! Running pump for $pump_duration seconds..."
    
    /home/andy/Sproutly/AutomatedPlanter/build/pump_on
    sleep $pump_duration
    /home/andy/Sproutly/AutomatedPlanter/build/pump_off
    
    # Report completion
    curl -X POST "$API_URL/watering" \
      -H "Content-Type: application/json" \
      -d "{\"plantId\": $PLANT_ID}"
    
    echo "Watering complete"
else
    echo "No watering needed"
fi