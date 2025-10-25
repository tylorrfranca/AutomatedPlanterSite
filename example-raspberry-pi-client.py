#!/usr/bin/env python3
"""
Example script for Raspberry Pi to send sensor data to the Automated Planter website.

This is a template that you need to customize with your actual sensor reading code.
"""

import requests
import json
import time
import sys

# Configuration - UPDATE THESE FOR YOUR SETUP
API_URL = "http://localhost:3000/api/sensors"  # Change to your server IP
UPDATE_INTERVAL = 5  # seconds between readings

def read_sensors():
    """
    Read values from your sensors.
    
    TODO: Replace this with your actual sensor reading code.
    Example implementations:
    - Use GPIO libraries for water level sensors
    - Use I2C/SPI for temperature/humidity sensors
    - Use ADC for analog sensors (light, soil moisture)
    """
    
    # PLACEHOLDER: Replace with actual sensor reading code
    # Example for demonstration:
    import random
    
    sensor_data = {
        "water_level": random.uniform(20, 100),
        "light_level": random.uniform(30, 90),
        "temperature": random.uniform(18, 30),
        "humidity": random.uniform(40, 80),
        "moisture": random.uniform(30, 70),
        "water_sensors": {
            "level_75": random.choice([True, False]),
            "level_50": random.choice([True, False]),
            "level_25": random.choice([True, False])
        }
    }
    
    return sensor_data

def send_sensor_data(data):
    """
    Send sensor data to the website API.
    
    Args:
        data: Dictionary containing sensor readings
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        response = requests.post(
            API_URL,
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✓ Data sent successfully (ID: {result['id']})")
            return True
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Connection error: Could not reach server")
        return False
    except requests.exceptions.Timeout:
        print("✗ Timeout: Server did not respond in time")
        return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Request error: {e}")
        return False

def main():
    """Main execution loop"""
    print("=" * 50)
    print("Automated Planter - Sensor Data Transmission")
    print("=" * 50)
    print(f"Target URL: {API_URL}")
    print(f"Update interval: {UPDATE_INTERVAL} seconds")
    print("Press Ctrl+C to stop\n")
    
    consecutive_failures = 0
    max_failures = 3
    
    try:
        while True:
            try:
                # Read sensors
                sensor_data = read_sensors()
                
                # Display reading
                print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Reading sensors...")
                print(f"  Water: {sensor_data['water_level']:.1f}%")
                print(f"  Light: {sensor_data['light_level']:.1f}%")
                print(f"  Temp:  {sensor_data['temperature']:.1f}°C")
                print(f"  Humidity: {sensor_data['humidity']:.1f}%")
                print(f"  Moisture: {sensor_data['moisture']:.1f}%")
                
                # Send to server
                success = send_sensor_data(sensor_data)
                
                if success:
                    consecutive_failures = 0
                    print("  Waiting for next reading...\n")
                    time.sleep(UPDATE_INTERVAL)
                else:
                    consecutive_failures += 1
                    if consecutive_failures >= max_failures:
                        print(f"\n⚠ Too many failures ({consecutive_failures}). "
                              "Waiting 30 seconds before retrying...\n")
                        time.sleep(30)
                        consecutive_failures = 0
                    else:
                        print("  Retrying in 10 seconds...\n")
                        time.sleep(10)
                        
            except KeyboardInterrupt:
                print("\n\nStopping sensor data transmission...")
                break
            except Exception as e:
                print(f"✗ Unexpected error: {e}")
                print("  Waiting 5 seconds before retrying...\n")
                time.sleep(5)
                
    except KeyboardInterrupt:
        print("\n\nProgram interrupted by user")
    finally:
        print("\nSensor data transmission stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()
