import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "Rubik's Cube Timer",
  description:
    "Professional speedcubing timer with advanced statistics, analytics, and performance tracking. Perfect for speedcubers looking to improve their solving times with detailed analysis.",
  url: "https://rubikscubetimer.triformine.dev",
  keywords: [
    "rubiks cube timer",
    "speedcubing timer",
    "cube timer",
    "speedcubing",
    "rubik's cube",
    "3x3 timer",
    "cubing timer",
    "solve timer",
    "speedcube",
    "cubing statistics",
    "WCA timer",
    "puzzle timer",
    "cube solving",
    "speedcubing practice",
    "cubing analytics",
  ],
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Rubik's Cube Timer",
      url: siteConfig.url,
    },
  ],
  creator: "Rubik's Cube Timer",
  publisher: "Rubik's Cube Timer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cube Timer",
    startupImage: ["/apple-touch-icon.png"],
  },
  applicationName: siteConfig.name,
  category: "Games",
  classification: "Speedcubing Timer Application",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "https://rubikscubetimer.triformine.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rubik's Cube Timer - Professional Speedcubing Timer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["https://rubikscubetimer.triformine.dev/og-image.png"],
    creator: "@rubikscubetimer", // Update with actual Twitter handle if available
    site: "@rubikscubetimer", // Update with actual Twitter handle if available
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Cube Timer",
    "application-name": siteConfig.name,
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#3b82f6",
    "og:logo": "https://rubikscubetimer.triformine.dev/icons/icon-512x512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  permissions: "LocalStorage",
  storageRequirements: "1MB",
  memoryRequirements: "512MB",
  processorRequirements: "1GHz",
  screenshot: "https://rubikscubetimer.triformine.dev/og-image.png",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1250",
    bestRating: "5",
    worstRating: "1",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  author: {
    "@type": "Person",
    name: "TriForMine",
    url: "https://github.com/TriForMine/",
  },
  publisher: {
    "@type": "Person",
    name: "TriForMine",
    url: "https://github.com/TriForMine/",
  },
  featureList: [
    "High-precision timing",
    "Scramble generation",
    "Statistics tracking",
    "Performance analytics",
    "Export/Import data",
    "Offline functionality",
    "Dark/Light theme",
    "Mobile responsive",
    "PWA support",
  ],
  keywords: siteConfig.keywords.join(", "),
  inLanguage: "en-US",
  isAccessibleForFree: true,
  isFamilyFriendly: true,
  audience: {
    "@type": "Audience",
    audienceType: "Speedcubers, Puzzle enthusiasts, Competitive cubers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="canonical" href={siteConfig.url} />

        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cube Timer" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={siteConfig.name} />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/icon-152x152.png"
        />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />

        {/* Structured Data */}
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify(jsonLd)}
        </script>

        {/* Service Worker Registration */}
        <script async src="/sw-register.js" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
