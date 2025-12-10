import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rhiz Event Architect | Intelligent Event Design",
  description: "Design identity-aware event experiences powered by Rhiz Protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased tracking-tight`}
      >
        <ClerkProvider publishableKey="pk_test_bWVldC1oeWVuYS01NC5jbGVyay5hY2NvdW50cy5kZXYk">
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
