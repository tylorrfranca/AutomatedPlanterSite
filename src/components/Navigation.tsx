"use client";

import { HStack, Box } from "panda";
import { Button, Badge } from "@radix-ui/themes";

interface NavigationProps {
  currentPage: 'home' | 'plants';
  onPageChange: (page: 'home' | 'plants') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <Box 
      position="fixed" 
      top="0" 
      left="0" 
      right="0" 
      zIndex="1000"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
        padding: '16px 0'
      }}
    >
      <HStack justify="space-between" alignItems="center" px="8" maxW="7xl" mx="auto">
        <HStack gap="4" alignItems="center">
          <Badge 
            size="2" 
            color="green" 
            variant="soft"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
              color: '#15803d',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px 16px'
            }}
          >
            🌱 AutonoPlant
          </Badge>
        </HStack>
        
        <HStack gap="4">
          <Button 
            size="2" 
            variant={currentPage === 'home' ? 'solid' : 'outline'}
            color="green"
            onClick={() => onPageChange('home')}
            style={{
              background: currentPage === 'home' 
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' 
                : 'transparent',
              border: currentPage === 'home' ? 'none' : '2px solid #22c55e',
              color: currentPage === 'home' ? 'white' : '#15803d',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Home
          </Button>
          <Button 
            size="2" 
            variant={currentPage === 'plants' ? 'solid' : 'outline'}
            color="green"
            onClick={() => onPageChange('plants')}
            style={{
              background: currentPage === 'plants' 
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' 
                : 'transparent',
              border: currentPage === 'plants' ? 'none' : '2px solid #22c55e',
              color: currentPage === 'plants' ? 'white' : '#15803d',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Plant Database
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
