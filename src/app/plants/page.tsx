"use client";

import Navigation from '@/components/Navigation';
import PlantManager from '@/components/PlantManager';
import { Box } from "panda";

export default function PlantsPage() {
    return (
        <Box minH="100vh" bg="white" position="relative">
            {/* Gradient Background Overlay */}
            <Box 
                position="absolute"
                top="0"
                left="0"
                right="0"
                height="100vh"
                background="radial-gradient(ellipse at top, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.08) 40%, transparent 70%)"
                zIndex="0"
            />
            
            <Navigation currentPage="plants" />
            <Box pt="80px" position="relative" zIndex="1">
                <PlantManager />
            </Box>
        </Box>
    );
}
