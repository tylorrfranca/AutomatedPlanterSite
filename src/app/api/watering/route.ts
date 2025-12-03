import { NextRequest, NextResponse } from 'next/server';
import { plantDb } from '@/lib/database';

// Pump rate: 100 mL/min
const PUMP_RATE_ML_PER_MIN = 100;

// GET - Check if watering is needed for a plant
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const plantIdParam = searchParams.get('plantId');
    
    if (!plantIdParam) {
      return NextResponse.json(
        { error: 'plantId parameter is required' },
        { status: 400 }
      );
    }

    const plantId = parseInt(plantIdParam);
    const plant = plantDb.getById(plantId);
    
    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    // Calculate if watering is needed
    let needsWatering = false;
    let timeLeftDays = 0;
    
    if (plant.last_watered_at) {
      const lastWateredDate = new Date(plant.last_watered_at);
      const now = new Date();
      const daysSinceLastWater = (now.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24);
      timeLeftDays = plant.watering_frequency - daysSinceLastWater;
      needsWatering = timeLeftDays <= 0;
    } else {
      // Never watered
      needsWatering = true;
    }

    // Calculate pump duration
    const pumpDurationSeconds = Math.round((plant.water_amount / PUMP_RATE_ML_PER_MIN) * 60);

    const response = {
      plant_id: plant.id,
      plant_name: plant.name,
      needs_watering: needsWatering,
      pump_duration_seconds: pumpDurationSeconds,
      water_amount_ml: plant.water_amount,
      time_left_days: Math.round(timeLeftDays * 10) / 10,
      watering_frequency_days: plant.watering_frequency,
      last_watered_at: plant.last_watered_at,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking watering status:', error);
    return NextResponse.json(
      { error: 'Failed to check watering status' },
      { status: 500 }
    );
  }
}

// POST - Mark plant as watered (Pi calls this after watering)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plantId } = body;
    
    if (!plantId) {
      return NextResponse.json(
        { error: 'plantId is required' },
        { status: 400 }
      );
    }

    const plant = plantDb.getById(plantId);
    
    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    // Update last_watered_at to now
    plantDb.markAsWatered(plantId);

    return NextResponse.json({
      success: true,
      plant_id: plantId,
      plant_name: plant.name,
      watered_at: new Date().toISOString(),
      next_watering_in_days: plant.watering_frequency
    });
  } catch (error) {
    console.error('Error marking plant as watered:', error);
    return NextResponse.json(
      { error: 'Failed to mark plant as watered' },
      { status: 500 }
    );
  }
}

