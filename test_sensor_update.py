#!/usr/bin/env python3
"""
Test script to simulate sensor updates from Raspberry Pi.
This script writes random sensor values to sensor_data.json to test the integration.

Run with: python3 test_sensor_update.py
"""

import json
import time
import random

def update_sensor_data(moisture, light, temp, humidity, water_level):
    """Update the sensor data JSON file"""
    sensor_data = {
        'moisture': moisture,
        'light': light,
        'temp': temp,
        'humidity': humidity,
        'waterLevel': water_level
    }
    
    file_path = 'public/sensor_data.json'
    
    with open(file_path, 'w') as f:
        json.dump(sensor_data, f, indent=2)
    
    print(f"✓ Updated: moisture={moisture:.2f}, light={light:.2f}, " +
          f"temp={temp:.1f}°C, humidity={humidity:.1f}%, waterLevel={water_level}")

def main():
    print("=" * 70)
    print("SENSOR DATA TEST - Simulating Raspberry Pi Updates")
    print("=" * 70)
    print("This script will update sensor_data.json every 3 seconds.")
    print("Open the website at /pi to see the values change in real-time.")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            # Generate random sensor values
            moisture = random.uniform(0.3, 0.7)      # 30-70%
            light = random.uniform(0.4, 0.9)         # 40-90%
            temp = random.uniform(18.0, 28.0)        # 18-28°C
            humidity = random.uniform(40.0, 70.0)    # 40-70%
            
            # Cycle through water levels
            water_levels = [0, 1, 3, 7]
            water_level = random.choice(water_levels)
            
            # Update the file
            update_sensor_data(moisture, light, temp, humidity, water_level)
            
            # Wait 3 seconds
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("\n\n✓ Test stopped. Final sensor_data.json has been saved.")

if __name__ == "__main__":
    main()

