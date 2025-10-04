import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextBoomCity - India's Premier Real Estate Platform",
  description: "Discover premium real estate opportunities in India's emerging cities. From Faridabad to Dholera, find your perfect investment with AI-powered insights.",
  keywords: "real estate, India, Faridabad, NCR, Dholera, Vrindavan, Ayodhya, property investment, real estate platform, property search",
  authors: [{ name: "NextBoomCity" }],
  creator: "NextBoomCity",
  publisher: "NextBoomCity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nextboomcity.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NextBoomCity - India's Premier Real Estate Platform",
    description: "Discover premium real estate opportunities in India's emerging cities. AI-powered insights for smart property investments.",
    url: "https://nextboomcity.com",
    siteName: "NextBoomCity",
    images: [
      {
        url: "https://nextboomcity.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NextBoomCity - India's Premier Real Estate Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextBoomCity - India's Premier Real Estate Platform",
    description: "Discover premium real estate opportunities in India's emerging cities. AI-powered insights for smart property investments.",
    images: ["https://nextboomcity.com/og-image.jpg"],
    creator: "@nextboomcity",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
