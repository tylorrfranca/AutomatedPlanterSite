import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/libs/utility/providers/Providers";
import { Box } from "panda";

const inter = Inter({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--inter-font",
});

export const metadata: Metadata = {
    title: "Sproutly - Automated Plant Care System",
    description: "The future of automated gardening. Intelligent plant care that adapts to your plants' needs, ensuring optimal growth with minimal effort.",
    icons: {
        icon: '/SproutlyLogoDesign.png',
        shortcut: '/SproutlyLogoDesign.png',
        apple: '/SproutlyLogoDesign.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                style={{ overflowX: "hidden" }}
                className={`${inter.variable}`}>
                <Providers>
                    <Box
                        scrollbarWidth={"none"}
                        width="screen"
                        padding="0"
                        minHeight="screen"
                        overflowX="hidden">
                        {children}
                    </Box>
                </Providers>
            </body>
        </html>
    );
}
