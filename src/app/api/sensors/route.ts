import { NextRequest, NextResponse } from 'next/server';
import { sensorDb } from '@/lib/database';
import type { CreateSensorReadingData, SensorReading } from '@/lib/database';

// Mock sensor data - fallback if no real data exists
function getMockSensorData() {
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

// GET - Retrieve the latest sensor reading
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const hours = searchParams.get('hours');

    let sensorData: SensorReading | SensorReading[] | undefined;

    // Get recent readings from last N hours
    if (hours) {
      const hoursNum = parseInt(hours);
      if (!isNaN(hoursNum) && hoursNum > 0) {
        sensorData = sensorDb.getRecent(hoursNum);
      }
    } 
    // Get all readings with optional limit
    else if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        sensorData = sensorDb.getAll(limitNum);
      }
    } 
    // Get latest single reading
    else {
      sensorData = sensorDb.getLatest();
    }

    // If no data in database, return mock data
    if (!sensorData) {
      const mockData = getMockSensorData();
      const actualWaterLevel = calculateWaterLevel(mockData.water_sensors);
      
      return NextResponse.json({
        water_level: actualWaterLevel,
        light_level: mockData.light_level,
        temperature: mockData.temperature,
        humidity: mockData.humidity,
        moisture: mockData.moisture,
        water_sensors: mockData.water_sensors,
        timestamp: new Date().toISOString(),
        is_mock: true
      });
    }

    // Format single reading response
    if (Array.isArray(sensorData)) {
      const formatted = sensorData.map(reading => ({
        water_level: reading.water_level,
        light_level: reading.light_level,
        temperature: reading.temperature,
        humidity: reading.humidity,
        moisture: reading.moisture,
        water_sensors: {
          level_75: reading.water_sensor_75,
          level_50: reading.water_sensor_50,
          level_25: reading.water_sensor_25
        },
        timestamp: reading.created_at,
        id: reading.id
      }));

      return NextResponse.json(formatted);
    }

    // Format single reading
    const formatted = {
      water_level: sensorData.water_level,
      light_level: sensorData.light_level,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      moisture: sensorData.moisture,
      water_sensors: {
        level_75: sensorData.water_sensor_75,
        level_50: sensorData.water_sensor_50,
        level_25: sensorData.water_sensor_25
      },
      timestamp: sensorData.created_at,
      id: sensorData.id
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}

// POST - Receive sensor data from Raspberry Pi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['water_level', 'light_level', 'temperature', 'humidity', 'moisture'];
    const missingFields = requiredFields.filter(field => body[field] === undefined);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare sensor reading data
    const sensorData: CreateSensorReadingData = {
      water_level: parseFloat(body.water_level),
      light_level: parseFloat(body.light_level),
      temperature: parseFloat(body.temperature),
      humidity: parseFloat(body.humidity),
      moisture: parseFloat(body.moisture),
      water_sensor_75: Boolean(body.water_sensor_75 || body.water_sensors?.level_75),
      water_sensor_50: Boolean(body.water_sensor_50 || body.water_sensors?.level_50),
      water_sensor_25: Boolean(body.water_sensor_25 || body.water_sensors?.level_25)
    };

    // Validate data ranges
    if (sensorData.water_level < 0 || sensorData.water_level > 100) {
      return NextResponse.json(
        { error: 'water_level must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (sensorData.light_level < 0 || sensorData.light_level > 100) {
      return NextResponse.json(
        { error: 'light_level must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (sensorData.humidity < 0 || sensorData.humidity > 100) {
      return NextResponse.json(
        { error: 'humidity must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (sensorData.moisture < 0 || sensorData.moisture > 100) {
      return NextResponse.json(
        { error: 'moisture must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Store in database
    const savedReading = sensorDb.create(sensorData);

    console.log('Sensor data received and saved:', {
      id: savedReading.id,
      timestamp: savedReading.created_at
    });

    return NextResponse.json({
      success: true,
      id: savedReading.id,
      timestamp: savedReading.created_at,
      message: 'Sensor data saved successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to save sensor data' },
      { status: 500 }
    );
  }
}
