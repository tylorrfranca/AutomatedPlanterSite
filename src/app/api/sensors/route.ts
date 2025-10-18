import { NextRequest, NextResponse } from 'next/server';

// Mock sensor data - in production this would come from the Raspberry Pi
interface SensorData {
  water_level: number; // 0-100 percentage
  light_level: number; // 0-100 percentage  
  temperature: number; // Celsius
  humidity: number; // 0-100 percentage
  moisture: number; // 0-100 percentage
  water_sensors: {
    level_75: boolean;
    level_50: boolean;
    level_25: boolean;
  };
}

// For now, return mock data. This will be replaced with real sensor readings
// from the Raspberry Pi hardware
function getMockSensorData(): SensorData {
  return {
    water_level: Math.random() * 100,
    light_level: Math.random() * 100,
    temperature: 20 + Math.random() * 15, // 20-35°C
    humidity: 30 + Math.random() * 50, // 30-80%
    moisture: Math.random() * 100,
    water_sensors: {
      level_75: Math.random() > 0.7,
      level_50: Math.random() > 0.5,
      level_25: Math.random() > 0.3,
    }
  };
}

// Calculate water level based on the 3 sensors at 75%, 50%, and 25%
function calculateWaterLevel(sensors: { level_75: boolean; level_50: boolean; level_25: boolean }): number {
  if (sensors.level_75) return 87.5; // Between 75% and 100%
  if (sensors.level_50) return 62.5; // Between 50% and 75%
  if (sensors.level_25) return 37.5; // Between 25% and 50%
  return 12.5; // Below 25%
}

export async function GET() {
  try {
    const mockData = getMockSensorData();
    
    // Calculate actual water level from sensors
    const actualWaterLevel = calculateWaterLevel(mockData.water_sensors);
    
    const sensorData = {
      water_level: actualWaterLevel,
      light_level: mockData.light_level,
      temperature: mockData.temperature,
      humidity: mockData.humidity,
      moisture: mockData.moisture,
      water_sensors: mockData.water_sensors,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(sensorData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}
