import { NextRequest, NextResponse } from 'next/server';
import { plantDb } from '@/lib/database';

// POST - Mark plant as watered
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid plant ID' },
        { status: 400 }
      );
    }

    const plant = plantDb.markWatered(id);
    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Plant marked as watered',
      plant: plant,
      last_watered_at: plant.last_watered_at
    });
  } catch (error) {
    console.error('Error marking plant as watered:', error);
    return NextResponse.json(
      { error: 'Failed to mark plant as watered' },
      { status: 500 }
    );
  }
}



