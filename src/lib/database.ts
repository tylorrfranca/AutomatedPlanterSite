import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'plants.db');
const db = new Database(dbPath);

// Initialize database with plants table
db.exec(`
  CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    water_amount REAL NOT NULL,
    watering_frequency INTEGER NOT NULL,
    light_min REAL NOT NULL,
    light_max REAL NOT NULL,
    soil_type TEXT NOT NULL,
    humidity_min REAL NOT NULL,
    humidity_max REAL NOT NULL,
    temperature_min REAL NOT NULL,
    temperature_max REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert initial plant data
const initialPlants = [
  {
    name: 'Snake Plant',
    water_amount: 250,
    watering_frequency: 14,
    light_min: 50,
    light_max: 200,
    soil_type: 'Well-draining potting mix',
    humidity_min: 30,
    humidity_max: 60,
    temperature_min: 15,
    temperature_max: 30
  },
  {
    name: 'Peace Lily',
    water_amount: 300,
    watering_frequency: 7,
    light_min: 100,
    light_max: 300,
    soil_type: 'Rich, well-draining soil',
    humidity_min: 50,
    humidity_max: 80,
    temperature_min: 18,
    temperature_max: 28
  },
  {
    name: 'Spider Plant',
    water_amount: 200,
    watering_frequency: 7,
    light_min: 100,
    light_max: 400,
    soil_type: 'Well-draining potting soil',
    humidity_min: 40,
    humidity_max: 70,
    temperature_min: 15,
    temperature_max: 30
  },
  {
    name: 'Pothos',
    water_amount: 250,
    watering_frequency: 7,
    light_min: 50,
    light_max: 300,
    soil_type: 'Well-draining potting mix',
    humidity_min: 40,
    humidity_max: 70,
    temperature_min: 18,
    temperature_max: 30
  },
  {
    name: 'Monstera',
    water_amount: 400,
    watering_frequency: 7,
    light_min: 200,
    light_max: 500,
    soil_type: 'Rich, well-draining soil',
    humidity_min: 60,
    humidity_max: 80,
    temperature_min: 20,
    temperature_max: 30
  },
  {
    name: 'ZZ Plant',
    water_amount: 200,
    watering_frequency: 21,
    light_min: 50,
    light_max: 200,
    soil_type: 'Well-draining potting mix',
    humidity_min: 30,
    humidity_max: 60,
    temperature_min: 15,
    temperature_max: 30
  },
  {
    name: 'Fiddle Leaf Fig',
    water_amount: 350,
    watering_frequency: 7,
    light_min: 200,
    light_max: 500,
    soil_type: 'Well-draining potting soil',
    humidity_min: 50,
    humidity_max: 70,
    temperature_min: 18,
    temperature_max: 28
  },
  {
    name: 'Aloe Vera',
    water_amount: 150,
    watering_frequency: 21,
    light_min: 200,
    light_max: 600,
    soil_type: 'Cactus/succulent mix',
    humidity_min: 30,
    humidity_max: 50,
    temperature_min: 15,
    temperature_max: 30
  },
  {
    name: 'Chinese Evergreen',
    water_amount: 250,
    watering_frequency: 10,
    light_min: 50,
    light_max: 200,
    soil_type: 'Well-draining potting mix',
    humidity_min: 40,
    humidity_max: 70,
    temperature_min: 18,
    temperature_max: 28
  },
  {
    name: 'Philodendron',
    water_amount: 300,
    watering_frequency: 7,
    light_min: 100,
    light_max: 400,
    soil_type: 'Rich, well-draining soil',
    humidity_min: 50,
    humidity_max: 80,
    temperature_min: 18,
    temperature_max: 30
  }
];

// Check if plants table is empty and insert initial data
const plantCount = db.prepare('SELECT COUNT(*) as count FROM plants').get() as { count: number };
if (plantCount.count === 0) {
  const insertPlant = db.prepare(`
    INSERT INTO plants (
      name, water_amount, watering_frequency, light_min, light_max, 
      soil_type, humidity_min, humidity_max, temperature_min, temperature_max
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  initialPlants.forEach(plant => {
    insertPlant.run(
      plant.name,
      plant.water_amount,
      plant.watering_frequency,
      plant.light_min,
      plant.light_max,
      plant.soil_type,
      plant.humidity_min,
      plant.humidity_max,
      plant.temperature_min,
      plant.temperature_max
    );
  });
}

export interface Plant {
  id: number;
  name: string;
  water_amount: number;
  watering_frequency: number;
  light_min: number;
  light_max: number;
  soil_type: string;
  humidity_min: number;
  humidity_max: number;
  temperature_min: number;
  temperature_max: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlantData {
  name: string;
  water_amount: number;
  watering_frequency: number;
  light_min: number;
  light_max: number;
  soil_type: string;
  humidity_min: number;
  humidity_max: number;
  temperature_min: number;
  temperature_max: number;
}

export const plantDb = {
  getAll: (): Plant[] => {
    return db.prepare('SELECT * FROM plants ORDER BY name').all() as Plant[];
  },

  getById: (id: number): Plant | undefined => {
    return db.prepare('SELECT * FROM plants WHERE id = ?').get(id) as Plant | undefined;
  },

  create: (plantData: CreatePlantData): Plant => {
    const stmt = db.prepare(`
      INSERT INTO plants (
        name, water_amount, watering_frequency, light_min, light_max, 
        soil_type, humidity_min, humidity_max, temperature_min, temperature_max
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      plantData.name,
      plantData.water_amount,
      plantData.watering_frequency,
      plantData.light_min,
      plantData.light_max,
      plantData.soil_type,
      plantData.humidity_min,
      plantData.humidity_max,
      plantData.temperature_min,
      plantData.temperature_max
    );
    
    return plantDb.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, plantData: Partial<CreatePlantData>): Plant | undefined => {
    const plant = plantDb.getById(id);
    if (!plant) return undefined;

    const updateFields = Object.keys(plantData)
      .filter(key => plantData[key as keyof CreatePlantData] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');

    if (updateFields.length === 0) return plant;

    const stmt = db.prepare(`
      UPDATE plants 
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const values = Object.values(plantData).filter(val => val !== undefined);
    values.push(id);
    
    stmt.run(...values);
    
    return plantDb.getById(id);
  },

  delete: (id: number): boolean => {
    const result = db.prepare('DELETE FROM plants WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

export default db;
