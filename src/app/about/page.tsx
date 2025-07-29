"use client";

import {
  Clock,
  BarChart3,
  Zap,
  Shield,
  Download,
  Trophy,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";

const features = [
  {
    icon: Clock,
    title: "High-Precision Timing",
    description:
      "Ultra-accurate timing with millisecond precision, spacebar controls, and WCA-standard inspection time support.",
    benefits: ["10ms accuracy", "Standard WCA timing", "Inspection timer"],
  },
  {
    icon: BarChart3,
    title: "Advanced Statistics",
    description:
      "Comprehensive solve analysis with averages, personal bests, session statistics, and trend visualization.",
    benefits: ["Ao5, Ao12, Ao100", "PB tracking", "Session analysis"],
  },
  {
    icon: Zap,
    title: "Smart Analytics",
    description:
      "Intelligent performance insights with charts, progress tracking, and detailed solve history management.",
    benefits: ["Performance charts", "Progress tracking", "Solve history"],
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "All your data stays on your device. No accounts required, no data collection, complete privacy control.",
    benefits: ["Local storage", "No tracking", "Data ownership"],
  },
];

const benefits = [
  "Track your improvement over time with detailed statistics",
  "Practice with professional-grade timing accuracy",
  "Analyze your performance with comprehensive charts",
  "Export and import your solve data",
  "Works offline - no internet required",
  "Free forever with no ads or premium tiers",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Rubik's Cube Timer",
  description:
    "Learn about the most advanced speedcubing timer with precision timing, comprehensive statistics, and powerful analytics tools.",
  url: "https://rubikscubetimer.triformine.dev/about",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "Rubik's Cube Timer",
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    description:
      "Professional speedcubing timer with advanced statistics and analytics",
    author: {
      "@type": "Person",
      name: "TriForMine",
      url: "https://github.com/TriForMine/",
    },
    creator: {
      "@type": "Person",
      name: "TriForMine",
      url: "https://github.com/TriForMine/",
    },
    features: [
      "High-precision timing",
      "Advanced statistics",
      "Performance analytics",
      "Offline functionality",
      "Data privacy",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About - Professional Speedcubing Timer</title>
        <meta
          name="description"
          content="Learn about Rubik's Cube Timer - the most advanced speedcubing timer with precision timing, comprehensive statistics, and powerful analytics tools for cubers of all levels."
        />
        <meta
          name="keywords"
          content="about rubiks cube timer, speedcubing timer features, cube timer app, speedcubing practice tool, cubing statistics, timer precision, speedcube training"
        />
        <meta property="og:title" content="About - Rubik's Cube Timer" />
        <meta
          property="og:description"
          content="The most advanced speedcubing timer with precision timing, comprehensive statistics, and powerful analytics."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About - Rubik's Cube Timer" />
        <meta
          name="twitter:description"
          content="The most advanced speedcubing timer with precision timing, comprehensive statistics, and powerful analytics."
        />
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify(jsonLd)}
        </script>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Navigation */}
        <nav className="border-b border-border/50 bg-card/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    🧩
                  </span>
                </div>
                <span className="text-xl font-bold">CubeTimer</span>
              </Link>

              <Button
                variant="outline"
                onClick={() => window.location.assign("/")}
              >
                Back to Timer
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" />
                Professional Speedcubing Tool
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                About <span className="text-primary">CubeTimer</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The most advanced speedcubing timer designed for cubers who want
                to track their progress, analyze their performance, and achieve
                their personal bests with professional-grade tools.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10ms</div>
                <div className="text-sm text-muted-foreground">
                  Timing Precision
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">
                  Privacy Focused
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">0€</div>
                <div className="text-sm text-muted-foreground">Always Free</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">PWA</div>
                <div className="text-sm text-muted-foreground">
                  Works Offline
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Built for Serious Speedcubers
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature is designed with speedcubing excellence in mind,
                from precision timing to comprehensive analytics.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose CubeTimer?</h2>
              <p className="text-lg text-muted-foreground">
                Designed by cubers, for cubers. Here&apos;s what makes us
                different.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We believe every speedcuber deserves access to professional-grade
              tools without compromising their privacy or paying subscription
              fees. CubeTimer is built to help you improve your times,
              understand your progress, and achieve your speedcubing goals - all
              while keeping your data completely private and under your control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="min-w-[200px]"
                onClick={() => window.location.assign("/")}
              >
                <Clock className="w-5 h-5 mr-2" />
                Start Timing
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px]"
                onClick={() => window.location.assign("/#install")}
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>

              <Button
                variant="gradient"
                size="lg"
                className="min-w-[200px]"
                onClick={() =>
                  window.open(
                    "https://github.com/sponsors/TriForMine",
                    "_blank",
                  )
                }
              >
                <Heart className="w-5 h-5 mr-2" />
                Sponsor
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">
                    🧩
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  CubeTimer v1.0 - Built with ❤️ by{" "}
                  <a
                    href="https://github.com/TriForMine/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    TriForMine
                  </a>
                  {" · "}
                  <a
                    href="https://github.com/sponsors/TriForMine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:underline font-medium"
                  >
                    💖 Sponsor
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Timer
                </Link>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
