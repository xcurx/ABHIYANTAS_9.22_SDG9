import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELEVATE | Host, Compete, Elevate Your Skills",
  description: "All-in-one platform for hosting hackathons and coding contests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarWrapper />
        <div className="pt-16">
          {children}
        </div>
        <ChatbotWidget />
      </body>
    </html>
  );
}
