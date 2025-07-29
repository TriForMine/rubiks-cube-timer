"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  Timer,
  BarChart3,
  Settings,
  Menu,
  Clock,
  Trophy,
  TrendingUp,
  Shuffle,
  ChevronRight,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wifi, WifiOff } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import Link from "next/link";

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sessionStats?: {
    count: number;
    bestTime: number | null;
    avgTime: number | null;
  };
}

const sidebarItems = [
  {
    id: "timer",
    label: "Timer",
    icon: Timer,
    description: "Practice solving",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900/50",
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: BarChart3,
    description: "View your progress",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    hoverColor: "hover:bg-green-100 dark:hover:bg-green-900/50",
  },
  {
    id: "times",
    label: "Times",
    icon: Clock,
    description: "Solve history",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "App preferences",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    hoverColor: "hover:bg-orange-100 dark:hover:bg-orange-900/50",
  },
];

const externalLinks = [
  {
    id: "about",
    label: "About",
    icon: Info,
    description: "Learn more",
    href: "/about",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    hoverColor: "hover:bg-indigo-100 dark:hover:bg-indigo-900/50",
  },
];

function SidebarContent({
  activeTab,
  onTabChange,
  sessionStats,
  onClose,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sessionStats?: AppLayoutProps["sessionStats"];
  onClose?: () => void;
}) {
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-card to-muted/30">
      {/* Brand Header */}
      <div className="p-6 pb-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Shuffle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              CubeTimer
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Speedcubing Practice
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-6">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={`nav-${item.id}`}
                  type="button"
                  className={cn(
                    "w-full group transition-all duration-200 cursor-pointer text-left",
                    isActive && "bg-primary/10 rounded-xl",
                  )}
                  onClick={() => handleTabChange(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTabChange(item.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center w-full p-4 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm"
                        : "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 mr-3",
                        isActive
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : "bg-muted/50 text-muted-foreground group-hover:bg-accent",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 text-left">
                      <div
                        className={cn(
                          "font-semibold text-sm transition-colors",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-0.5 transition-colors",
                          isActive
                            ? "text-primary/70"
                            : "text-muted-foreground group-hover:text-muted-foreground/80",
                        )}
                      >
                        {item.description}
                      </div>
                    </div>

                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* External Links */}
          <div className="mt-6 space-y-2">
            <div className="px-2 pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                More
              </h3>
            </div>
            {externalLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={cn(
                    "w-full group transition-all duration-200 cursor-pointer text-left block",
                  )}
                  onClick={onClose}
                >
                  <div
                    className={cn(
                      "flex items-center w-full p-4 rounded-xl transition-all duration-200",
                      "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 mr-3",
                        `${link.bgColor} ${link.color} shadow-sm`,
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm text-foreground transition-colors">
                        {link.label}
                      </div>
                      <div className="text-xs mt-0.5 text-muted-foreground transition-colors">
                        {link.description}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Enhanced Session Stats */}
          {sessionStats && sessionStats.count > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Session Stats
                </h3>
              </div>

              <div className="space-y-3">
                <StatCard
                  title="Total Solves"
                  value={sessionStats.count}
                  icon={<Clock className="w-4 h-4" />}
                  className="border-blue-200/50 dark:border-blue-800/50"
                />

                {sessionStats.bestTime && (
                  <StatCard
                    title="Best Time"
                    value={formatTime(sessionStats.bestTime)}
                    icon={<Trophy className="w-4 h-4" />}
                    trend="up"
                    className="border-green-200/50 dark:border-green-800/50"
                  />
                )}

                {sessionStats.avgTime && (
                  <StatCard
                    title="Average"
                    value={formatTime(sessionStats.avgTime)}
                    icon={<TrendingUp className="w-4 h-4" />}
                    className="border-purple-200/50 dark:border-purple-800/50"
                  />
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Enhanced Footer */}
      <div className="p-6 pt-4 border-t border-border/50 bg-muted/20">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-semibold text-foreground">
              CubeTimer v0.1.0
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ by{" "}
            <a
              href="https://github.com/TriForMine/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              TriForMine
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  sessionStats,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Handle online/offline status
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const activeItem = sidebarItems.find((item) => item.id === activeTab);

  return (
    <div className="h-screen flex bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-border/50 lg:shadow-xl lg:backdrop-blur-sm">
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          sessionStats={sessionStats}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-80 p-0 bg-card/95 backdrop-blur-md border-border/50"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            sessionStats={sessionStats}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Enhanced Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-md supports-[backdrop-filter]:bg-card/30 z-10 shadow-sm">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-accent/80 active:scale-95 transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>

              {/* Page Title with Icon */}
              <div className="flex items-center space-x-3">
                {activeItem && (
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                      activeItem.bgColor,
                      activeItem.color,
                    )}
                  >
                    <activeItem.icon className="w-5 h-5" />
                  </div>
                )}
                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight capitalize bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {activeTab}
                  </h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {activeTab === "timer" &&
                      "Practice your solves with precision timing"}
                    {activeTab === "statistics" &&
                      "Track your progress and improvements"}
                    {activeTab === "times" &&
                      "View and manage your solve history"}
                    {activeTab === "settings" && "Configure your preferences"}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Stats in Header */}
              {activeTab === "timer" &&
                sessionStats &&
                sessionStats.count > 0 && (
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-6 text-sm bg-muted/50 rounded-lg px-4 py-2 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground font-medium">
                          Session:
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {sessionStats.count}
                        </span>
                      </div>
                      {sessionStats.bestTime && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-muted-foreground font-medium">
                            Best:
                          </span>
                          <span className="font-mono font-bold text-green-600 dark:text-green-400">
                            {formatTime(sessionStats.bestTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              <Separator
                orientation="vertical"
                className="h-6 hidden md:block opacity-50"
              />

              {/* Online Status Indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                <Separator orientation="vertical" className="h-4 opacity-50" />

                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Enhanced Styling */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-transparent via-transparent to-muted/20 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
