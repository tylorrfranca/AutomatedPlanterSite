"use client";

import { useState, useEffect } from 'react';
import { VStack, HStack, Box, Container } from "panda";
import { Heading, Text } from "@radix-ui/themes";

interface SensorData {
  water_level: number;
  light_level: number;
  temperature: number;
  humidity: number;
  moisture: number;
  water_sensors: {
    level_75: boolean;
    level_50: boolean;
    level_25: boolean;
  };
  timestamp: string;
}

interface SensorBarProps {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  goodZone?: { min: number; max: number };
  waterLevels?: boolean;
  sensorLevels?: { level_75: boolean; level_50: boolean; level_25: boolean };
}

function SensorBar({ 
  label, 
  value, 
  maxValue, 
  unit, 
  color, 
  goodZone, 
  waterLevels = false,
  sensorLevels 
}: SensorBarProps) {
  const percentage = (value / maxValue) * 100;
  const isBelowThreshold = waterLevels && value < 25;

  return (
    <VStack gap="3" alignItems="center" style={{ minWidth: '140px' }}>
      <Text size="3" weight="medium" style={{ color: '#374151', fontSize: '16px' }}>
        {label}
      </Text>
      
      <Box
        position="relative"
        width="80px"
        height="280px"
        bg="gray.100"
        borderRadius="12px"
        border="3px solid"
        borderColor="gray.300"
        overflow="hidden"
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      >
        {/* Water level markers */}
        {waterLevels && (
          <>
            <Box
              position="absolute"
              left="0"
              right="0"
              height="2px"
              top="25%"
              bg="blue.500"
              zIndex="2"
            />
            <Box
              position="absolute"
              left="0"
              right="0"
              height="2px"
              top="50%"
              bg="blue.500"
              zIndex="2"
            />
            <Box
              position="absolute"
              left="0"
              right="0"
              height="2px"
              top="75%"
              bg="blue.500"
              zIndex="2"
            />
            {/* Water level indicator lines */}
            <Box
              position="absolute"
              left="-40px"
              top="20%"
              fontSize="12px"
              color="blue.600"
              fontWeight="600"
            >
              75
            </Box>
            <Box
              position="absolute"
              left="-40px"
              top="45%"
              fontSize="12px"
              color="blue.600"
              fontWeight="600"
            >
              50
            </Box>
            <Box
              position="absolute"
              left="-40px"
              top="70%"
              fontSize="12px"
              color="blue.600"
              fontWeight="600"
            >
              25
            </Box>
          </>
        )}

        {/* Good zone indicators for non-water sensors */}
        {!waterLevels && goodZone && (
          <>
            <Box
              position="absolute"
              left="0"
              right="0"
              height="2px"
              top={`${((maxValue - goodZone.max) / maxValue) * 100}%`}
              bg="black"
              zIndex="2"
            />
            <Box
              position="absolute"
              left="0"
              right="0"
              height="2px"
              top={`${((maxValue - goodZone.min) / maxValue) * 100}%`}
              bg="black"
              zIndex="2"
            />
          </>
        )}

        {/* Fill bar */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height={`${Math.min(percentage, 100)}%`}
          style={{
            background: color.includes('gradient') ? color : undefined,
            backgroundColor: !color.includes('gradient') ? color : undefined,
            transition: 'height 0.3s ease'
          }}
        />
      </Box>
      
      <Text size="2" style={{ color: '#6b7280', fontSize: '14px' }}>
        {value.toFixed(1)}{unit}
      </Text>
      
      {/* Water level status */}
      {waterLevels && (
        <Text 
          size="2" 
          style={{ 
            color: isBelowThreshold ? '#dc2626' : '#16a34a',
            fontWeight: '600',
            fontSize: '12px'
          }}
        >
          {sensorLevels?.level_75 ? 'High' : 
           sensorLevels?.level_50 ? 'Medium' : 
           sensorLevels?.level_25 ? 'Low' : 'Critical'}
        </Text>
      )}
    </VStack>
  );
}

export default function PiDisplay() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flashing, setFlashing] = useState(false);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensors');
      const data = await response.json();
      setSensorData(data);
      
      // Trigger flashing if water level is below 25%
      const isLowWater = data.water_level < 25;
      setFlashing(isLowWater);
      
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    setLoading(false);
    
    // Fetch sensor data every 5 seconds for real-time updates
    const interval = setInterval(fetchSensorData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Flashing effect for low water level
  useEffect(() => {
    if (flashing) {
      const interval = setInterval(() => {
        setFlashing(prev => !prev);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [flashing]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text size="4">Loading sensor data...</Text>
      </Box>
    );
  }

  if (!sensorData) {
    return (
      <Box
        minH="100vh"
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text size="4" style={{ color: '#dc2626' }}>
          Failed to load sensor data
        </Text>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="white"
      position="relative"
      style={{
        transition: 'background-color 1s ease'
      }}
    >
      {/* Sproutly Logo in top left */}
      <Box
        position="absolute"
        top="20px"
        left="20px"
        zIndex="10"
      >
        <img 
          src="/SproutlyLogoDesign.png" 
          alt="Sproutly Logo" 
          style={{
            width: "100px",
            height: "100px",
          }}
        />
      </Box>

      {/* Plant Name */}
      <Box
        position="absolute"
        top="30px"
        left="140px"
        zIndex="10"
      >
        <Heading size="6" style={{ color: '#15803d', fontSize: '24px' }}>
          Plant Name
        </Heading>
      </Box>

      {/* Main sensor display */}
      <Container
        maxW="full"
        py="8"
        px="8"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        pt="140px"
      >
        <HStack gap="16" alignItems="end" flexWrap="wrap" justify="center" style={{ paddingTop: '60px' }}>
          
          {/* Water Level Sensor */}
          <SensorBar
            label="Water"
            value={sensorData.water_level}
            maxValue={100}
            unit="%"
            color="linear-gradient(to top, #1e40af, #3b82f6, #60a5fa)"
            waterLevels={true}
            sensorLevels={sensorData.water_sensors}
          />

          {/* Light Sensor */}
          <SensorBar
            label="Light"
            value={sensorData.light_level}
            maxValue={100}
            unit="%"
            color="linear-gradient(to top, #fbbf24, #f59e0b, #d97706)"
            goodZone={{ min: 30, max: 70 }}
          />

          {/* Temperature Sensor */}
          <SensorBar
            label="Temp"
            value={sensorData.temperature}
            maxValue={50}
            unit="°C"
            color="linear-gradient(to top, #dc2626, #ef4444, #f87171)"
            goodZone={{ min: 18, max: 28 }}
          />

          {/* Humidity Sensor */}
          <SensorBar
            label="Humidity"
            value={sensorData.humidity}
            maxValue={100}
            unit="%"
            color="linear-gradient(to top, #1e3a8a, #3b82f6, #60a5fa)"
            goodZone={{ min: 40, max: 70 }}
          />

          {/* Moisture Sensor */}
          <SensorBar
            label="Moisture"
            value={sensorData.moisture}
            maxValue={100}
            unit="%"
            color="linear-gradient(to top, #16a34a, #22c55e, #4ade80)"
            goodZone={{ min: 30, max: 60 }}
          />
        </HStack>
      </Container>

      {/* Low water level warning */}
      {flashing && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(220, 38, 38, 0.1)"
          pointerEvents="none"
          zIndex="5"
          animation="pulse 1s infinite"
          style={{
            animation: 'pulse 1s infinite'
          }}
        />
      )}
    </Box>
  );
}
