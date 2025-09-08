import { NextRequest, NextResponse } from 'next/server';
import { plantDb, CreatePlantData } from '@/lib/database';

export async function GET() {
  try {
    const plants = plantDb.getAll();
    return NextResponse.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plantData: CreatePlantData = body;

    // Validate required fields
    const requiredFields = [
      'name', 'water_amount', 'watering_frequency', 'light_min', 'light_max',
      'soil_type', 'soil_moisture_min', 'soil_moisture_max', 'humidity_min', 'humidity_max', 'temperature_min', 'temperature_max'
    ];

    for (const field of requiredFields) {
      if (!(field in plantData)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newPlant = plantDb.create(plantData);
    return NextResponse.json(newPlant, { status: 201 });
  } catch (error) {
    console.error('Error creating plant:', error);
    return NextResponse.json(
      { error: 'Failed to create plant' },
      { status: 500 }
    );
  }
}
