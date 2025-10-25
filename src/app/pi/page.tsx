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

  // Calculate threshold positions for non-water sensors (measured from top)
  // For goodZone min=35, max=65, we want lines at 35% from bottom (65% from top) and 65% from bottom (35% from top)
  const minThresholdPosition = goodZone && !waterLevels ? (1 - (goodZone.min / maxValue)) * 100 : 0;
  const maxThresholdPosition = goodZone && !waterLevels ? (1 - (goodZone.max / maxValue)) * 100 : 0;
  
  // Debug logging (can be removed later)
  if (!waterLevels && goodZone && process.env.NODE_ENV === 'development') {
    console.log(`${label} thresholds:`, {
      minPosition: minThresholdPosition,
      maxPosition: maxThresholdPosition,
      goodZone,
      maxValue
    });
  }

  return (
    <VStack gap="1" alignItems="center" style={{ minWidth: '130px', height: '550px', justifyContent: 'flex-start' }}>
      <Text size="1" weight="medium" style={{ color: '#374151', fontSize: '28px', marginBottom: '5px' }}>
        {label}
      </Text>
      
      <Box
        position="relative"
        width="100px"
        height="470px"
        bg="#f3f4f6"
        borderRadius="10px"
        overflow="hidden"
        style={{ 
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => {
          const sensorMap: { [key: string]: string } = {
            'Water': 'water',
            'Light': 'light',
            'Temp': 'temp',
            'Humidity': 'humidity',
            'Moisture': 'moisture'
          };
          const sensor = sensorMap[label] || 'water';
          window.location.href = `/pi/history/${sensor}`;
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
        }}
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
                  bg="black"
                  zIndex="2"
                />
                <Box
                  position="absolute"
                  left="0"
                  right="0"
                  height="2px"
                  top="50%"
                  bg="black"
                  zIndex="2"
                />
                <Box
                  position="absolute"
                  left="0"
                  right="0"
                  height="2px"
                  top="75%"
                  bg="black"
                  zIndex="2"
                />
          </>
        )}

        {/* Good zone indicators for non-water sensors */}
        {!waterLevels && goodZone && (
          <>
            <div
              style={{
                position: 'absolute',
                left: '0',
                right: '0',
                height: '2px',
                top: `${Math.min(minThresholdPosition, maxThresholdPosition)}%`,
                backgroundColor: 'black',
                zIndex: 2
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '0',
                right: '0',
                height: '2px',
                top: `${Math.max(minThresholdPosition, maxThresholdPosition)}%`,
                backgroundColor: 'black',
                zIndex: 2
              }}
            />
          </>
        )}

        {/* Fill bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
            transition: 'height 0.3s ease',
            borderRadius: percentage >= 99 ? '10px' : '10px 10px 0 0',
            zIndex: 1
          }}
        />
      </Box>
      
      <Text size="1" style={{ color: '#1f2937', fontSize: '28px', fontWeight: '600', textAlign: 'center', marginTop: '5px' }}>
        {value.toFixed(1)}{unit}
      </Text>
      
      {/* Water level status or placeholder for alignment */}
      {waterLevels ? (
        <Text 
          size="1" 
          style={{ 
            color: isBelowThreshold ? '#dc2626' : '#16a34a',
            fontWeight: '600',
            fontSize: '22px',
            marginTop: '5px'
          }}
        >
          {sensorLevels?.level_75 ? 'High' : 
           sensorLevels?.level_50 ? 'Medium' : 
           sensorLevels?.level_25 ? 'Low' : 'Critical'}
        </Text>
      ) : (
        <Text 
          size="1" 
          style={{ 
            color: 'transparent',
            fontSize: '22px',
            height: '28px',
            marginTop: '5px'
          }}
        >
          &nbsp;
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
      height="100vh"
      bg="white"
      position="relative"
      overflow="hidden"
      style={{
        transition: 'background-color 1s ease'
      }}
    >
      {/* Sproutly Logo in top left */}
      <Box
        position="absolute"
        top="10px"
        left="-20px"
        zIndex="10"
        padding="20px"
      >
        <img 
          src="/SproutlyLogoDesign.png" 
          alt="Sproutly Logo" 
          style={{
            width: "160px",
            height: "160px",
          }}
        />
      </Box>


      {/* Main sensor display */}
      <Container
        maxW="full"
        py="0"
        px="4"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        pt="80px"
        pb="15px"
      >
        <HStack gap="20" alignItems="center" flexWrap="wrap" justify="center" style={{ paddingTop: '0px' }}>
          
              {/* Water Level Sensor */}
              <SensorBar
                label="Water"
                value={sensorData.water_level}
                maxValue={100}
                unit="%"
                color="#3b82f6"
                waterLevels={true}
                sensorLevels={sensorData.water_sensors}
              />

              {/* Light Sensor */}
              <SensorBar
                label="Light"
                value={sensorData.light_level}
                maxValue={100}
                unit="%"
                color="#eab308"
                goodZone={{ min: 35, max: 65 }}
              />

              {/* Temperature Sensor */}
              <SensorBar
                label="Temp"
                value={sensorData.temperature}
                maxValue={50}
                unit="°C"
                color="#ef4444"
                goodZone={{ min: 17.5, max: 32.5 }}
              />

              {/* Humidity Sensor */}
              <SensorBar
                label="Humidity"
                value={sensorData.humidity}
                maxValue={100}
                unit="%"
                color="#6b7280"
                goodZone={{ min: 35, max: 65 }}
              />

              {/* Moisture Sensor */}
              <SensorBar
                label="Moisture"
                value={sensorData.moisture}
                maxValue={100}
                unit="%"
                color="#a855f7"
                goodZone={{ min: 35, max: 65 }}
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
          bg="rgba(220, 38, 38, 0.25)"
          pointerEvents="none"
          zIndex="5"
          animation="pulse 1s infinite"
          style={{
            animation: 'pulse 1s infinite'
          }}
        />
      )}

      {/* Timestamp at bottom */}
      {sensorData && (
        <Box
          position="absolute"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
          bg="rgba(255, 255, 255, 0.9)"
          px="4"
          py="2"
          borderRadius="8"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Text size="2" style={{ color: '#6b7280', fontSize: '14px' }}>
            Last updated: {new Date(sensorData.timestamp).toLocaleTimeString()}
          </Text>
        </Box>
      )}
    </Box>
  );
}
