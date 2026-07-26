import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://metromitra.vercel.app"),
  title: {
    default: "MetroMitra — Find your people on the line you already ride",
    template: "%s · MetroMitra",
  },
  description:
    "MetroMitra is a hyperlocal community for Indian metro commuters. Share last-mile rides, post entrepreneurial ideas, recover lost items, and trade within your station's community.",
  keywords: [
    "Indian metro",
    "Delhi Metro",
    "Mumbai Metro",
    "Namma Metro Bengaluru",
    "Hyderabad Metro",
    "Chennai Metro",
    "Kolkata Metro",
    "carpool",
    "travel buddy",
    "lost and found",
    "metro community",
    "MetroMitra",
  ],
  authors: [{ name: "MetroMitra" }],
  creator: "MetroMitra",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MetroMitra — Find your people on the line you already ride",
    description:
      "A hyperlocal community for Indian metro commuters: shared rides, travel buddies, lost & found, and a station marketplace.",
    url: "https://metromitra.vercel.app",
    siteName: "MetroMitra",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "MetroMitra — Find your people on the line you already ride",
    description:
      "A hyperlocal community for Indian metro commuters: shared rides, travel buddies, lost & found, and a station marketplace.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}
