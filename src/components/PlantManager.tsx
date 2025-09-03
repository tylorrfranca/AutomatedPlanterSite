"use client";

import { useState, useEffect } from 'react';
import { VStack, HStack, Box, Container } from "panda";
import { Heading, Text, Button, Card, Badge, TextField, Select, TextArea } from "@radix-ui/themes";
import { Plant, CreatePlantData } from '@/lib/database';

interface PlantFormData {
  name: string;
  water_amount: string;
  watering_frequency: string;
  light_min: string;
  light_max: string;
  soil_type: string;
  humidity_min: string;
  humidity_max: string;
  temperature_min: string;
  temperature_max: string;
}

export default function PlantManager() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState<PlantFormData>({
    name: '',
    water_amount: '',
    watering_frequency: '',
    light_min: '',
    light_max: '',
    soil_type: '',
    humidity_min: '',
    humidity_max: '',
    temperature_min: '',
    temperature_max: ''
  });

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await fetch('/api/plants');
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PlantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      water_amount: '',
      watering_frequency: '',
      light_min: '',
      light_max: '',
      soil_type: '',
      humidity_min: '',
      humidity_max: '',
      temperature_min: '',
      temperature_max: ''
    });
    setEditingPlant(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const plantData: CreatePlantData = {
      name: formData.name,
      water_amount: parseFloat(formData.water_amount),
      watering_frequency: parseInt(formData.watering_frequency),
      light_min: parseFloat(formData.light_min),
      light_max: parseFloat(formData.light_max),
      soil_type: formData.soil_type,
      humidity_min: parseFloat(formData.humidity_min),
      humidity_max: parseFloat(formData.humidity_max),
      temperature_min: parseFloat(formData.temperature_min),
      temperature_max: parseFloat(formData.temperature_max)
    };

    try {
      if (editingPlant) {
        await fetch(`/api/plants/${editingPlant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plantData)
        });
      } else {
        await fetch('/api/plants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plantData)
        });
      }
      
      await fetchPlants();
      resetForm();
    } catch (error) {
      console.error('Error saving plant:', error);
    }
  };

  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      water_amount: plant.water_amount.toString(),
      watering_frequency: plant.watering_frequency.toString(),
      light_min: plant.light_min.toString(),
      light_max: plant.light_max.toString(),
      soil_type: plant.soil_type,
      humidity_min: plant.humidity_min.toString(),
      humidity_max: plant.humidity_max.toString(),
      temperature_min: plant.temperature_min.toString(),
      temperature_max: plant.temperature_max.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plant?')) return;
    
    try {
      await fetch(`/api/plants/${id}`, { method: 'DELETE' });
      await fetchPlants();
    } catch (error) {
      console.error('Error deleting plant:', error);
    }
  };

  if (loading) {
    return (
      <Container maxW="7xl" py="8" px="8">
        <Text>Loading plants...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py="8" px="8">
      <VStack gap="8" alignItems="stretch">
        <HStack justify="space-between" alignItems="center">
          <VStack gap="2" alignItems="start">
            <Heading size="6" style={{ color: '#15803d' }}>
              Plant Database
            </Heading>
            <Text style={{ color: '#6b7280' }}>
              Manage your plant collection and their care requirements
            </Text>
          </VStack>
          <Button 
            size="3" 
            color="green"
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              border: 'none',
              color: 'white',
              fontWeight: '600'
            }}
          >
            Add New Plant
          </Button>
        </HStack>

        {showForm && (
          <Card style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
            <VStack gap="6">
              <Heading size="4">
                {editingPlant ? 'Edit Plant' : 'Add New Plant'}
              </Heading>
              
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack gap="4">
                  <HStack gap="4" style={{ width: '100%' }}>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Plant Name</Text>
                      <TextField.Root
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter plant name"
                        required
                      />
                    </VStack>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Water Amount (ml)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.water_amount}
                        onChange={(e) => handleInputChange('water_amount', e.target.value)}
                        placeholder="250"
                        required
                      />
                    </VStack>
                  </HStack>

                  <HStack gap="4" style={{ width: '100%' }}>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Watering Frequency (days)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.watering_frequency}
                        onChange={(e) => handleInputChange('watering_frequency', e.target.value)}
                        placeholder="7"
                        required
                      />
                    </VStack>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Soil Type</Text>
                      <TextField.Root
                        value={formData.soil_type}
                        onChange={(e) => handleInputChange('soil_type', e.target.value)}
                        placeholder="Well-draining potting mix"
                        required
                      />
                    </VStack>
                  </HStack>

                  <HStack gap="4" style={{ width: '100%' }}>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Light Min (lux)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.light_min}
                        onChange={(e) => handleInputChange('light_min', e.target.value)}
                        placeholder="50"
                        required
                      />
                    </VStack>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Light Max (lux)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.light_max}
                        onChange={(e) => handleInputChange('light_max', e.target.value)}
                        placeholder="300"
                        required
                      />
                    </VStack>
                  </HStack>

                  <HStack gap="4" style={{ width: '100%' }}>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Humidity Min (%)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.humidity_min}
                        onChange={(e) => handleInputChange('humidity_min', e.target.value)}
                        placeholder="40"
                        required
                      />
                    </VStack>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Humidity Max (%)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.humidity_max}
                        onChange={(e) => handleInputChange('humidity_max', e.target.value)}
                        placeholder="70"
                        required
                      />
                    </VStack>
                  </HStack>

                  <HStack gap="4" style={{ width: '100%' }}>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Temperature Min (°C)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.temperature_min}
                        onChange={(e) => handleInputChange('temperature_min', e.target.value)}
                        placeholder="18"
                        required
                      />
                    </VStack>
                    <VStack gap="2" style={{ flex: 1 }}>
                      <Text size="2" weight="medium">Temperature Max (°C)</Text>
                      <TextField.Root
                        type="number"
                        value={formData.temperature_max}
                        onChange={(e) => handleInputChange('temperature_max', e.target.value)}
                        placeholder="30"
                        required
                      />
                    </VStack>
                  </HStack>

                  <HStack gap="4" justify="end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      color="green"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      {editingPlant ? 'Update Plant' : 'Add Plant'}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </Card>
        )}

        <Box 
          display="grid" 
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
          gap="6"
        >
          {plants.map((plant) => (
            <Card 
              key={plant.id}
              style={{ 
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              <VStack gap="4" alignItems="start">
                <HStack justify="space-between" style={{ width: '100%' }}>
                  <Heading size="4" style={{ color: '#15803d' }}>
                    {plant.name}
                  </Heading>
                  <Badge color="green" variant="soft">
                    ID: {plant.id}
                  </Badge>
                </HStack>

                <VStack gap="2" alignItems="start" style={{ width: '100%' }}>
                  <HStack gap="2">
                    <Text size="2" weight="medium">💧 Water:</Text>
                    <Text size="2">{plant.water_amount}ml every {plant.watering_frequency} days</Text>
                  </HStack>
                  
                  <HStack gap="2">
                    <Text size="2" weight="medium">☀️ Light:</Text>
                    <Text size="2">{plant.light_min}-{plant.light_max} lux</Text>
                  </HStack>
                  
                  <HStack gap="2">
                    <Text size="2" weight="medium">🌡️ Temp:</Text>
                    <Text size="2">{plant.temperature_min}°C - {plant.temperature_max}°C</Text>
                  </HStack>
                  
                  <HStack gap="2">
                    <Text size="2" weight="medium">💨 Humidity:</Text>
                    <Text size="2">{plant.humidity_min}% - {plant.humidity_max}%</Text>
                  </HStack>
                  
                  <HStack gap="2">
                    <Text size="2" weight="medium">🌱 Soil:</Text>
                    <Text size="2">{plant.soil_type}</Text>
                  </HStack>
                </VStack>

                <HStack gap="2" style={{ width: '100%' }}>
                  <Button 
                    size="2" 
                    variant="outline"
                    onClick={() => handleEdit(plant)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="2" 
                    color="red" 
                    variant="outline"
                    onClick={() => handleDelete(plant.id)}
                    style={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </HStack>
              </VStack>
            </Card>
          ))}
        </Box>

        {plants.length === 0 && !showForm && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <VStack gap="4">
              <Text size="4" weight="medium" style={{ color: '#6b7280' }}>
                No plants found
              </Text>
              <Text style={{ color: '#9ca3af' }}>
                Add your first plant to get started!
              </Text>
            </VStack>
          </Card>
        )}
      </VStack>
    </Container>
  );
}
