"use client";

import { useState } from 'react';
import { VStack, HStack, Box, Container } from "panda";
import { Heading, Text, Button, Card, Badge } from "@radix-ui/themes";
import Navigation from '@/components/Navigation';
import PlantManager from '@/components/PlantManager';

export default function Home() {
    const [currentPage, setCurrentPage] = useState<'home' | 'plants'>('home');

    if (currentPage === 'plants') {
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
                
                <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
                <Box pt="80px" position="relative" zIndex="1">
                    <PlantManager />
                </Box>
            </Box>
        );
    }

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
            
            <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
            
            {/* Hero Section */}
            <Container maxW="7xl" py="20" px="8" position="relative" zIndex="1" pt="140px">
                <VStack gap="12" alignItems="center">
                    {/* Header */}
                    <VStack gap="6" textAlign="center" maxW="6xl">
                        {/* Logo */}
                        <img 
                            src="/SproutlyLogoDesign.png" 
                            alt="Sproutly Logo" 
                            style={{
                                width: "400px",
                                height: "400px",
                                marginBottom: "50px",
                                filter: "drop-shadow(0 16px 32px rgba(34, 197, 94, 0.5))"
                            }}
                        />
                        
                        <Text 
                            style={{ 
                                fontSize: "32px",
                                lineHeight: "1.3", 
                                maxWidth: "900px",
                                color: "#1f2937",
                                fontWeight: "500",
                                letterSpacing: "-0.01em",
                                marginBottom: "32px"
                            }}
                        >
                            The future of intelligent gardening. Revolutionary plant care that learns, adapts, and nurtures.
                        </Text>
                        
                        <HStack gap="6" justify="center" mt="8">
                            <Button 
                                size="4" 
                                color="green" 
                                variant="solid"
                                onClick={() => setCurrentPage('plants')}
                                style={{
                                    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 25%, #4ade80 75%, #86efac 100%)",
                                    border: "none",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    padding: "16px 32px",
                                    borderRadius: "12px",
                                    boxShadow: "0 6px 25px rgba(34, 197, 94, 0.4), 0 2px 8px rgba(34, 197, 94, 0.2)",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    color: "white"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 10px 35px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(34, 197, 94, 0.3)";
                                    e.currentTarget.style.background = "linear-gradient(135deg, #15803d 0%, #16a34a 25%, #22c55e 75%, #4ade80 100%)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 6px 25px rgba(34, 197, 94, 0.4), 0 2px 8px rgba(34, 197, 94, 0.2)";
                                    e.currentTarget.style.background = "linear-gradient(135deg, #16a34a 0%, #22c55e 25%, #4ade80 75%, #86efac 100%)";
                                }}
                            >
                                Manage Plants
                            </Button>
                        </HStack>
                    </VStack>

                    {/* Features Grid */}
                    <Box w="full" mt="32">
                        <VStack gap="16" alignItems="center">
                            <VStack gap="4" textAlign="center">
                                <Heading 
                                    style={{
                                        fontSize: "48px",
                                        fontWeight: "700",
                                        letterSpacing: "-0.02em",
                                        color: "#111827",
                                        marginBottom: "8px"
                                    }}
                                >
                                    Engineered for excellence.
                                </Heading>
                                <Text 
                                    style={{
                                        fontSize: "21px",
                                        color: "#6b7280",
                                        maxWidth: "600px",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    Every component designed to work in perfect harmony with nature.
                                </Text>
                            </VStack>
                            
                            <Box w="full" display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="8" mt="16">
                                <Card 
                                    style={{ 
                                        background: "rgba(255, 255, 255, 0.8)",
                                        backdropFilter: "blur(20px)",
                                        border: "1px solid rgba(0, 0, 0, 0.05)",
                                        borderRadius: "24px",
                                        padding: "40px 32px",
                                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-8px)";
                                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
                                    }}
                                >
                                    <VStack gap="6" alignItems="center">
                                        <Box 
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "20px",
                                                background: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #86efac 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "40px",
                                                border: "2px solid rgba(34, 197, 94, 0.3)",
                                                boxShadow: "0 8px 20px rgba(34, 197, 94, 0.25), 0 2px 8px rgba(34, 197, 94, 0.15)"
                                            }}
                                        >
                                            🌡️
                                        </Box>
                                        <VStack gap="3" textAlign="center">
                                            <Heading 
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "600",
                                                    color: "#111827",
                                                    letterSpacing: "-0.01em"
                                                }}
                                            >
                                                Smart Monitoring
                                            </Heading>
                                            <Text 
                                                style={{
                                                    fontSize: "16px",
                                                    color: "#6b7280",
                                                    lineHeight: "1.6",
                                                    textAlign: "center"
                                                }}
                                            >
                                                Advanced sensors continuously monitor soil moisture, temperature, and light levels with laboratory-grade precision.
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Card>

                                <Card 
                                    style={{ 
                                        background: "rgba(255, 255, 255, 0.8)",
                                        backdropFilter: "blur(20px)",
                                        border: "1px solid rgba(0, 0, 0, 0.05)",
                                        borderRadius: "24px",
                                        padding: "40px 32px",
                                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-8px)";
                                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
                                    }}
                                >
                                    <VStack gap="6" alignItems="center">
                                        <Box 
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "20px",
                                                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "40px",
                                                border: "2px solid rgba(59, 130, 246, 0.3)",
                                                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(59, 130, 246, 0.15)"
                                            }}
                                        >
                                            💧
                                        </Box>
                                        <VStack gap="3" textAlign="center">
                                            <Heading 
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "600",
                                                    color: "#111827",
                                                    letterSpacing: "-0.01em"
                                                }}
                                            >
                                                Precision Watering
                                            </Heading>
                                            <Text 
                                                style={{
                                                    fontSize: "16px",
                                                    color: "#6b7280",
                                                    lineHeight: "1.6",
                                                    textAlign: "center"
                                                }}
                                            >
                                                AI-powered irrigation system delivers the exact amount of water your plants need, when they need it.
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Card>

                                <Card 
                                    style={{ 
                                        background: "rgba(255, 255, 255, 0.8)",
                                        backdropFilter: "blur(20px)",
                                        border: "1px solid rgba(0, 0, 0, 0.05)",
                                        borderRadius: "24px",
                                        padding: "40px 32px",
                                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-8px)";
                                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
                                    }}
                                >
                                    <VStack gap="6" alignItems="center">
                                        <Box 
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "20px",
                                                background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde047 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "40px",
                                                border: "2px solid rgba(245, 158, 11, 0.3)",
                                                boxShadow: "0 8px 20px rgba(245, 158, 11, 0.25), 0 2px 8px rgba(245, 158, 11, 0.15)"
                                            }}
                                        >
                                            📱
                                        </Box>
                                        <VStack gap="3" textAlign="center">
                                            <Heading 
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "600",
                                                    color: "#111827",
                                                    letterSpacing: "-0.01em"
                                                }}
                                            >
                                                Seamless Control
                                            </Heading>
                                            <Text 
                                                style={{
                                                    fontSize: "16px",
                                                    color: "#6b7280",
                                                    lineHeight: "1.6",
                                                    textAlign: "center"
                                                }}
                                            >
                                                Intuitive app interface gives you complete control and real-time insights from anywhere in the world.
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Card>
                            </Box>
                        </VStack>
                    </Box>


                    {/* Final CTA Section */}
                    <VStack gap="8" textAlign="center" mt="32" mb="16">
                        <VStack gap="4">
                            <Heading 
                                style={{
                                    fontSize: "52px",
                                    fontWeight: "700",
                                    color: "#111827",
                                    letterSpacing: "-0.02em",
                                    maxWidth: "800px",
                                    lineHeight: "1.1"
                                }}
                            >
                                Ready to revolutionize your garden?
                            </Heading>
                            <Text 
                                style={{
                                    fontSize: "24px",
                                    color: "#6b7280",
                                    maxWidth: "600px",
                                    lineHeight: "1.4"
                                }}
                            >
                                Join the future of intelligent gardening. Your plants will thank you.
                            </Text>
                        </VStack>
                        
                        
                        <Text 
                            style={{
                                fontSize: "16px",
                                color: "#9ca3af",
                                marginTop: "16px"
                            }}
                        >
                            Free shipping • 30-day trial • Expert support included
                        </Text>
                    </VStack>
        </VStack>
            </Container>
        </Box>
    );
}
