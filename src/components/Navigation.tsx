"use client";

import { HStack, Box } from "panda";
import { Button, Badge } from "@radix-ui/themes";
import { useRouter, usePathname } from 'next/navigation';

interface NavigationProps {
  currentPage?: 'home' | 'plants';
  onPageChange?: (page: 'home' | 'plants') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine current page from pathname if not provided
  const actualCurrentPage = currentPage || (pathname === '/plants' ? 'plants' : 'home');
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
            🌱 Sproutly
          </Badge>
        </HStack>
        
        <HStack gap="4">
          <Button 
            size="2" 
            variant={actualCurrentPage === 'home' ? 'solid' : 'outline'}
            color="green"
            onClick={() => {
              if (onPageChange) {
                onPageChange('home');
              } else {
                router.push('/');
              }
            }}
            style={{
              background: actualCurrentPage === 'home' 
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' 
                : 'transparent',
              border: actualCurrentPage === 'home' ? 'none' : '2px solid #22c55e',
              color: actualCurrentPage === 'home' ? 'white' : '#15803d',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Home
          </Button>
          <Button 
            size="2" 
            variant={actualCurrentPage === 'plants' ? 'solid' : 'outline'}
            color="green"
            onClick={() => {
              if (onPageChange) {
                onPageChange('plants');
              } else {
                router.push('/plants');
              }
            }}
            style={{
              background: actualCurrentPage === 'plants' 
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' 
                : 'transparent',
              border: actualCurrentPage === 'plants' ? 'none' : '2px solid #22c55e',
              color: actualCurrentPage === 'plants' ? 'white' : '#15803d',
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
