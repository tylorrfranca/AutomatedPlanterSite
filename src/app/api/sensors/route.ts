import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sensorDb, plantDb } from '@/lib/database';
import type { CreateSensorReadingData } from '@/lib/database';

// Path to the sensor data JSON file (will be updated by Pi)
const SENSOR_FILE_PATH = path.join(process.cwd(), 'public', 'sensor_data.json');

// Interface for the Pi's JSON format
interface PiSensorData {
  moisture: number;      // 0.0 to 1.0
  light: number;         // 0.0 to 1.0
  temp: number;          // Temperature in Celsius
  humidity: number;      // 0.0 to 100.0
  waterLevel: number;    // 0, 1, 3, or 7
  // Optional watering info (can be updated by Pi or calculated by API)
  watering_frequency?: number;        // Days between waterings
  time_left_before_water?: number;    // Days until next watering
  pump_duration_seconds?: number;     // Seconds to run pump for water_amount
}

// Convert water level value to percentage and sensor states
function convertWaterLevel(waterLevel: number): { percentage: number; level_75: boolean; level_50: boolean; level_25: boolean } {
  switch (waterLevel) {
    case 7:  // 100%
      return { percentage: 100, level_75: true, level_50: true, level_25: true };
    case 3:  // 70%
      return { percentage: 70, level_75: false, level_50: true, level_25: true };
    case 1:  // 50%
      return { percentage: 50, level_75: false, level_50: true, level_25: false };
    case 0:  // 15%
      return { percentage: 15, level_75: false, level_50: false, level_25: false };
    default:
      return { percentage: 15, level_75: false, level_50: false, level_25: false };
  }
}

// Read sensor data from JSON file
function readSensorFile(): PiSensorData | null {
  try {
    if (!fs.existsSync(SENSOR_FILE_PATH)) {
      console.log('Sensor file not found, creating default file');
      // Create default sensor file
      const defaultData: PiSensorData = {
        moisture: 0.5,
        light: 0.75,
        temp: 22.24,
        humidity: 50.0,
        waterLevel: 3
      };
      fs.writeFileSync(SENSOR_FILE_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    const fileContent = fs.readFileSync(SENSOR_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent) as PiSensorData;
    return data;
  } catch (error) {
    console.error('Error reading sensor file:', error);
    return null;
  }
}

// Track last file modification time to avoid duplicate database entries
let lastFileModTime = 0;

// Pump rate: 100 mL/min
const PUMP_RATE_ML_PER_MIN = 100;

// Calculate watering information for a plant
function calculateWateringInfo(plantId: number | null) {
  if (!plantId) {
    return null;
  }

  const plant = plantDb.getById(plantId);
  if (!plant) {
    return null;
  }

  const wateringFrequencyDays = plant.watering_frequency;
  const waterAmountMl = plant.water_amount;
  
  // Calculate pump duration in seconds
  // Pump rate: 100 mL/min = 100/60 mL/sec
  const pumpDurationSeconds = Math.round((waterAmountMl / PUMP_RATE_ML_PER_MIN) * 60);

  // Calculate time left before next watering
  let timeLeftBeforeWaterDays: number;
  if (plant.last_watered_at) {
    const lastWateredDate = new Date(plant.last_watered_at);
    const now = new Date();
    const daysSinceLastWater = (now.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24);
    timeLeftBeforeWaterDays = Math.max(0, wateringFrequencyDays - daysSinceLastWater);
  } else {
    // If never watered, assume it needs watering now
    timeLeftBeforeWaterDays = 0;
  }

  return {
    watering_frequency: wateringFrequencyDays,
    time_left_before_water: Math.round(timeLeftBeforeWaterDays * 10) / 10, // Round to 1 decimal
    pump_duration_seconds: pumpDurationSeconds,
    water_amount_ml: waterAmountMl,
    needs_watering: timeLeftBeforeWaterDays <= 0
  };
}

// GET - Retrieve sensor data (latest or historical)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = searchParams.get('hours');
    
    // If hours parameter is provided, return historical data from database
    if (hours) {
      const hoursNum = parseInt(hours);
      if (!isNaN(hoursNum) && hoursNum > 0) {
        const readings = sensorDb.getRecent(hoursNum);
        
        const formatted = readings.map(reading => ({
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
    }
    
    // Otherwise, read latest from JSON file and save to database
    const piData = readSensorFile();
    
    if (!piData) {
      return NextResponse.json(
        { error: 'Failed to read sensor data file' },
        { status: 500 }
      );
    }
    
    // Get plant ID from query parameter (if provided by Pi)
    const plantIdParam = searchParams.get('plantId');
    const plantId = plantIdParam ? parseInt(plantIdParam) : null;
    
    // Calculate watering information if plant ID is provided
    const wateringInfo = calculateWateringInfo(plantId);
    
    // Check if file has been modified since last read
    try {
      const stats = fs.statSync(SENSOR_FILE_PATH);
      const currentModTime = stats.mtimeMs;
      
      // If file was modified, save new data to database
      if (currentModTime > lastFileModTime) {
        lastFileModTime = currentModTime;
        
        // Convert Pi data format to database format
        const waterLevelData = convertWaterLevel(piData.waterLevel);
        
        const dbData: CreateSensorReadingData = {
          water_level: waterLevelData.percentage,
          light_level: piData.light * 100,  // Convert 0.0-1.0 to 0-100
          temperature: piData.temp,
          humidity: piData.humidity,
          moisture: piData.moisture * 100,  // Convert 0.0-1.0 to 0-100
          water_sensor_75: waterLevelData.level_75,
          water_sensor_50: waterLevelData.level_50,
          water_sensor_25: waterLevelData.level_25
        };
        
        // Save to database
        const savedReading = sensorDb.create(dbData);
        console.log('Sensor data saved to database:', {
          id: savedReading.id,
          timestamp: savedReading.created_at,
          source: 'json_file'
        });
      }
    } catch (err) {
      console.error('Error checking file modification time:', err);
    }
    
    // Convert Pi data format to website format
    const waterLevelData = convertWaterLevel(piData.waterLevel);
    
    const formatted: any = {
      water_level: waterLevelData.percentage,
      light_level: piData.light * 100,  // Convert 0.0-1.0 to 0-100
      temperature: piData.temp,
      humidity: piData.humidity,
      moisture: piData.moisture * 100,  // Convert 0.0-1.0 to 0-100
      water_sensors: {
        level_75: waterLevelData.level_75,
        level_50: waterLevelData.level_50,
        level_25: waterLevelData.level_25
      },
      timestamp: new Date().toISOString(),
      source: 'json_file'
    };

    // Add watering information if available
    if (wateringInfo) {
      formatted.watering = wateringInfo;
    }

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}

// No POST endpoint needed - Pi will update the JSON file directly
