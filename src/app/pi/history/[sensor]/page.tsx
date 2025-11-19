"use client";

import { useState, useEffect } from 'react';
import { VStack, HStack, Box, Container } from "panda";
import { Heading, Text, Button, Select } from "@radix-ui/themes";
import { useRouter, useParams } from 'next/navigation';

interface HistoryDataPoint {
  timestamp: string;
  value: number;
}

// Mock historical data generator
function generateMockHistory(sensorName: string, hours: number = 24): HistoryDataPoint[] {
  const data: HistoryDataPoint[] = [];
  const now = Date.now();
  
  // Generate data points every 5 minutes
  const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
  const points = (hours * 60) / 5; // Number of 5-minute intervals
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now - (i * interval));
    let value: number;
    
    // Generate realistic values based on sensor type
    switch (sensorName) {
      case 'water':
        value = 40 + Math.random() * 50;
        break;
      case 'light':
        value = 30 + Math.random() * 40;
        break;
      case 'temp':
        value = 20 + Math.random() * 10;
        break;
      case 'humidity':
        value = 40 + Math.random() * 40;
        break;
      case 'moisture':
        value = 30 + Math.random() * 50;
        break;
      default:
        value = 50;
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: parseFloat(value.toFixed(2))
    });
  }
  
  return data;
}

export default function SensorHistory() {
  const router = useRouter();
  const params = useParams();
  const sensor = params.sensor as string;
  
  const [timeRange, setTimeRange] = useState<number>(24); // hours
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState<number>(1200);
  
  // Sensor configuration
  const sensorConfig = {
    water: { label: 'Water Level', unit: '%', color: '#3b82f6', max: 100 },
    light: { label: 'Light', unit: '%', color: '#eab308', max: 100 },
    temp: { label: 'Temperature', unit: '°C', color: '#ef4444', max: 50 },
    humidity: { label: 'Humidity', unit: '%', color: '#6b7280', max: 100 },
    moisture: { label: 'Moisture', unit: '%', color: '#a855f7', max: 100 }
  };
  
  const config = sensorConfig[sensor as keyof typeof sensorConfig] || sensorConfig.water;
  
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true);
      try {
        // Fetch historical data from API
        const response = await fetch(`/api/sensors?hours=${timeRange}`);
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Extract the relevant sensor values
          const sensorFieldMap: { [key: string]: keyof typeof data[0] } = {
            water: 'water_level',
            light: 'light_level',
            temp: 'temperature',
            humidity: 'humidity',
            moisture: 'moisture'
          };
          
          const field = sensorFieldMap[sensor] || 'water_level';
          
          const historyPoints = data.map(reading => ({
            timestamp: reading.timestamp,
            value: reading[field] as number
          }));
          
          setHistoryData(historyPoints);
        } else {
          // If no database data, use mock data
          const mockData = generateMockHistory(sensor, timeRange);
          setHistoryData(mockData);
        }
      } catch (error) {
        console.error('Error fetching history data:', error);
        // Fallback to mock data on error
        const mockData = generateMockHistory(sensor, timeRange);
        setHistoryData(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoryData();
  }, [sensor, timeRange]);
  
  // Update chart width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') {
        setChartWidth(window.innerWidth * 0.85);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate min, max, and average
  const values = historyData.map(d => d.value);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  
  return (
    <Box
      minH="100vh"
      bg="white"
      position="relative"
    >
      {/* Header */}
      <Box
        bg="white"
        borderBottom="1px solid #e5e7eb"
        position="sticky"
        top="0"
        zIndex="10"
        px="8"
        py="4"
      >
        <Container maxW="7xl">
          <HStack justify="space-between" alignItems="center">
            <HStack gap="4" alignItems="center">
              <Button 
                variant="outline"
                onClick={() => router.push('/pi')}
                style={{ cursor: 'pointer' }}
              >
                ← Back
              </Button>
              <VStack gap="0" alignItems="start">
                <Heading size="5">{config.label} History</Heading>
                <Text size="2" style={{ color: '#6b7280' }}>
                  Last {timeRange} hours
                </Text>
              </VStack>
            </HStack>
            
            <HStack gap="3">
              <Select.Root value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="1">1 Hour</Select.Item>
                  <Select.Item value="6">6 Hours</Select.Item>
                  <Select.Item value="24">24 Hours</Select.Item>
                  <Select.Item value="48">48 Hours</Select.Item>
                  <Select.Item value="168">7 Days</Select.Item>
                </Select.Content>
              </Select.Root>
            </HStack>
          </HStack>
        </Container>
      </Box>
      
      {/* Stats Bar */}
      <Box bg="#f9fafb" py="6" borderBottom="1px solid #e5e7eb">
        <Container maxW="7xl">
          <HStack gap="8" justify="center">
            <VStack gap="1" alignItems="center">
              <Text size="2" style={{ color: '#6b7280' }}>Current</Text>
              <Text size="5" weight="bold" style={{ color: config.color }}>
                {historyData.length > 0 ? historyData[historyData.length - 1].value.toFixed(1) : '0'}{config.unit}
              </Text>
            </VStack>
            <Box width="1px" bg="#e5e7eb" height="40px" />
            <VStack gap="1" alignItems="center">
              <Text size="2" style={{ color: '#6b7280' }}>Average</Text>
              <Text size="5" weight="bold" style={{ color: '#111827' }}>
                {avg.toFixed(1)}{config.unit}
              </Text>
            </VStack>
            <Box width="1px" bg="#e5e7eb" height="40px" />
            <VStack gap="1" alignItems="center">
              <Text size="2" style={{ color: '#6b7280' }}>Min</Text>
              <Text size="5" weight="bold" style={{ color: '#dc2626' }}>
                {min.toFixed(1)}{config.unit}
              </Text>
            </VStack>
            <Box width="1px" bg="#e5e7eb" height="40px" />
            <VStack gap="1" alignItems="center">
              <Text size="2" style={{ color: '#6b7280' }}>Max</Text>
              <Text size="5" weight="bold" style={{ color: '#16a34a' }}>
                {max.toFixed(1)}{config.unit}
              </Text>
            </VStack>
          </HStack>
        </Container>
      </Box>
      
      {/* Chart Area */}
      <Container maxW="7xl" py="8">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
            <Text size="4" style={{ color: '#6b7280' }}>Loading history data...</Text>
          </Box>
        ) : (
          <VStack gap="4">
            {/* Chart */}
            <Box
              bg="white"
              border="1px solid #e5e7eb"
              borderRadius="12"
              p="6"
              width="100%"
              minH="400px"
              position="relative"
            >
              {/* Simple line chart using SVG */}
              <svg width="100%" height="400" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="50"
                    y1={80 + (i * 80)}
                    x2="100%"
                    y2={80 + (i * 80)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map(i => (
                  <text
                    key={i}
                    x="40"
                    y={80 + (i * 80) + 5}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {(config.max * (1 - i * 0.25)).toFixed(0)}
                  </text>
                ))}
                
                {/* Draw the line */}
                {historyData.length > 1 && (
                  <polyline
                    points={historyData.map((point, i) => {
                      const divisor = historyData.length - 1 || 1; // Prevent division by zero
                      const x = 60 + (i / divisor) * (chartWidth - 120);
                      const y = 360 - ((point.value / config.max) * 280) - 40;
                      // Ensure values are valid numbers, default to 0 if NaN
                      const validX = isNaN(x) ? 60 : x;
                      const validY = isNaN(y) ? 360 : y;
                      return `${validX},${validY}`;
                    }).join(' ')}
                    fill="none"
                    stroke={config.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                
                {/* Data points */}
                {historyData.map((point, i) => {
                  const divisor = historyData.length - 1 || 1; // Prevent division by zero
                  const x = 60 + (i / divisor) * (chartWidth - 120);
                  const y = 360 - ((point.value / config.max) * 280) - 40;
                  // Ensure values are valid numbers, default to 0 if NaN, then cast to string
                  const validX = isNaN(x) ? 60 : x;
                  const validY = isNaN(y) ? 360 : y;
                  return (
                    <circle
                      key={i}
                      cx={String(validX)}
                      cy={String(validY)}
                      r="4"
                      fill={config.color}
                      style={{ cursor: 'pointer' }}
                      title={`${point.value}${config.unit} at ${formatTime(point.timestamp)}`}
                    />
                  );
                })}
              </svg>
            </Box>
            
            {/* X-axis time labels */}
            <Box width="100%" px="4">
              <HStack justify="space-between">
                {historyData.filter((_, i) => i % Math.ceil(historyData.length / 6) === 0 || i === historyData.length - 1).map((point, i) => (
                  <Text key={i} size="2" style={{ color: '#6b7280' }}>
                    {formatDate(point.timestamp)} {formatTime(point.timestamp)}
                  </Text>
                ))}
              </HStack>
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
