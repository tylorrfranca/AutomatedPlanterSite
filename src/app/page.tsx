import { VStack, HStack, Box, Container } from "panda";
import { Heading, Text, Button, Card, Badge, Flex } from "@radix-ui/themes";

export default function Home() {
    return (
        <Box minH="100vh" bg="white">
            {/* Hero Section */}
            <Container maxW="6xl" py="20" px="6">
                <VStack gap="12" alignItems="center">
                    {/* Header */}
                    <VStack gap="6" textAlign="center" maxW="4xl">
                        <Badge size="2" color="green" variant="soft">
                            🌱 Smart Agriculture
                        </Badge>
                        
                        <Heading 
                            size="9" 
                            weight="bold"
                            style={{
                                background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}
                        >
                            AutonoPlant
                        </Heading>
                        
                        <Text size="6" color="gray" style={{ lineHeight: "1.6", maxWidth: "600px" }}>
                            The future of automated gardening. Intelligent plant care that adapts to your plants' needs, 
                            ensuring optimal growth with minimal effort.
                        </Text>
                        
                        <HStack gap="4" justify="center" mt="6">
                            <Button size="4" color="green" variant="solid">
                                Get Started
                            </Button>
                            <Button size="4" variant="outline">
                                Learn More
                            </Button>
                        </HStack>
                    </VStack>

                    {/* Features Grid */}
                    <Box w="full" mt="16">
                        <VStack gap="8" alignItems="center">
                            <Heading size="6" textAlign="center">
                                Smart Features for Effortless Gardening
                            </Heading>
                            
                            <Box w="full" display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="6">
                                <Card size="3" style={{ background: "var(--gray-1)", border: "1px solid var(--gray-4)" }}>
                                    <VStack gap="4" p="4">
                                        <Box fontSize="3rem" textAlign="center">🌡️</Box>
                                        <Heading size="4" textAlign="center">Smart Monitoring</Heading>
                                        <Text color="gray" textAlign="center" size="3">
                                            Real-time monitoring of soil moisture, temperature, and light levels 
                                            to ensure optimal growing conditions.
                                        </Text>
                                    </VStack>
                                </Card>

                                <Card size="3" style={{ background: "var(--gray-1)", border: "1px solid var(--gray-4)" }}>
                                    <VStack gap="4" p="4">
                                        <Box fontSize="3rem" textAlign="center">💧</Box>
                                        <Heading size="4" textAlign="center">Auto Watering</Heading>
                                        <Text color="gray" textAlign="center" size="3">
                                            Intelligent watering system that delivers the perfect amount of water 
                                            based on your plant's specific needs.
                                        </Text>
                                    </VStack>
                                </Card>

                                <Card size="3" style={{ background: "var(--gray-1)", border: "1px solid var(--gray-4)" }}>
                                    <VStack gap="4" p="4">
                                        <Box fontSize="3rem" textAlign="center">📱</Box>
                                        <Heading size="4" textAlign="center">Mobile Control</Heading>
                                        <Text color="gray" textAlign="center" size="3">
                                            Monitor and control your AutonoPlant from anywhere with our 
                                            intuitive mobile app interface.
                                        </Text>
                                    </VStack>
                                </Card>
                            </Box>
                        </VStack>
                    </Box>

                    {/* Benefits Section */}
                    <Box w="full" mt="16" p="8" bg="green.2" borderRadius="xl">
                        <VStack gap="6" textAlign="center">
                            <Heading size="6" color="green">Why Choose AutonoPlant?</Heading>
                            <Box w="full" display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6">
                                <HStack gap="3" justify="center">
                                    <Box color="green" fontSize="1.5rem">✓</Box>
                                    <Text size="4" weight="medium">Save 80% of watering time</Text>
                                </HStack>
                                <HStack gap="3" justify="center">
                                    <Box color="green" fontSize="1.5rem">✓</Box>
                                    <Text size="4" weight="medium">Increase plant growth by 40%</Text>
                                </HStack>
                                <HStack gap="3" justify="center">
                                    <Box color="green" fontSize="1.5rem">✓</Box>
                                    <Text size="4" weight="medium">Reduce plant mortality by 90%</Text>
                                </HStack>
                                <HStack gap="3" justify="center">
                                    <Box color="green" fontSize="1.5rem">✓</Box>
                                    <Text size="4" weight="medium">Perfect for beginners & experts</Text>
                                </HStack>
                            </Box>
                        </VStack>
                    </Box>

                    {/* Call to Action */}
                    <VStack gap="4" textAlign="center" mt="16">
                        <Heading size="5">Ready to Transform Your Garden?</Heading>
                        <Text size="4" color="gray">
                            Join thousands of satisfied gardeners who've made the switch to automated plant care.
                        </Text>
                        <Button size="4" color="green" variant="solid" mt="4">
                            Start Your Smart Garden Today
                        </Button>
                    </VStack>
                </VStack>
            </Container>
        </Box>
    );
}
