# AutonoPlant - Smart Agriculture Technology

A modern web application for intelligent plant care management with SQLite database integration.

## Features

### 🌱 Plant Database Management
- **10 Pre-loaded Plants**: Snake Plant, Peace Lily, Spider Plant, Pothos, Monstera, ZZ Plant, Fiddle Leaf Fig, Aloe Vera, Chinese Evergreen, Philodendron
- **Add Custom Plants**: Create your own plant entries with specific care requirements
- **Edit Existing Plants**: Modify any plant's care parameters
- **Delete Plants**: Remove plants from the database
- **Comprehensive Plant Data**: Each plant includes:
  - Water amount needed (ml)
  - Watering frequency (days)
  - Light requirements (min/max lux)
  - Soil type preferences
  - Soil moisture requirements (min/max %)
  - Humidity requirements (min/max %)
  - Temperature requirements (min/max °C)

### 🎨 Modern UI
- Beautiful gradient design with green theme
- Responsive layout for all devices
- Smooth animations and hover effects
- Intuitive navigation between sections

### 🛠️ Technical Stack
- **Frontend**: Next.js 14 with React 18
- **Styling**: Panda CSS with Radix UI components
- **Database**: SQLite with better-sqlite3
- **TypeScript**: Full type safety
- **API Routes**: RESTful endpoints for CRUD operations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AutomatedPlanterSite
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The SQLite database (`plants.db`) will be automatically created when you first run the application. It includes:

- **10 pre-loaded plants** with realistic care requirements
- **Automatic table creation** with proper schema
- **CRUD operations** via API endpoints

## API Endpoints

### Plants
- `GET /api/plants` - Get all plants
- `POST /api/plants` - Create a new plant
- `GET /api/plants/[id]` - Get a specific plant
- `PUT /api/plants/[id]` - Update a plant
- `DELETE /api/plants/[id]` - Delete a plant

### Plant Data Structure
```typescript
interface Plant {
  id: number;
  name: string;
  water_amount: number;        // ml
  watering_frequency: number; // days
  light_min: number;          // lux
  light_max: number;          // lux
  soil_type: string;
  soil_moisture_min: number;  // %
  soil_moisture_max: number;  // %
  humidity_min: number;       // %
  humidity_max: number;       // %
  temperature_min: number;    // °C
  temperature_max: number;    // °C
  created_at: string;
  updated_at: string;
}
```

## Usage

### Navigation
- **Home**: Landing page with product information
- **Plant Database**: Manage your plant collection

### Adding a Plant
1. Navigate to "Plant Database"
2. Click "Add New Plant"
3. Fill in all required fields:
   - Plant name
   - Water amount (ml)
   - Watering frequency (days)
   - Light requirements (min/max lux)
   - Soil type
   - Soil moisture requirements (min/max %)
   - Humidity requirements (min/max %)
   - Temperature requirements (min/max °C)
4. Click "Add Plant"

### Editing a Plant
1. Find the plant card in the database
2. Click "Edit"
3. Modify the desired fields
4. Click "Update Plant"

### Deleting a Plant
1. Find the plant card in the database
2. Click "Delete"
3. Confirm the deletion

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prepare` - Generate Panda CSS styles

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── plants/
│   │       ├── route.ts          # GET/POST all plants
│   │       └── [id]/route.ts      # GET/PUT/DELETE specific plant
│   ├── layout.tsx
│   ├── page.tsx                  # Main page with navigation
│   └── globals.css
├── components/
│   ├── Navigation.tsx            # Navigation component
│   └── PlantManager.tsx          # Plant management interface
└── lib/
    └── database.ts               # SQLite database operations
```

## Database Schema

```sql
CREATE TABLE plants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  water_amount REAL NOT NULL,
  watering_frequency INTEGER NOT NULL,
  light_min REAL NOT NULL,
  light_max REAL NOT NULL,
  soil_type TEXT NOT NULL,
  soil_moisture_min REAL NOT NULL,
  soil_moisture_max REAL NOT NULL,
  humidity_min REAL NOT NULL,
  humidity_max REAL NOT NULL,
  temperature_min REAL NOT NULL,
  temperature_max REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
