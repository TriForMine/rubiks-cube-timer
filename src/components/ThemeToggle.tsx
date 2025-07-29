"use client";

import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="animate-pulse">
        <div className="h-4 w-4 bg-muted rounded" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    );
  }

  const themes = [
    {
      name: "Light",
      value: "light",
      icon: Sun,
      description: "Light mode",
    },
    {
      name: "Dark",
      value: "dark",
      icon: Moon,
      description: "Dark mode",
    },
    {
      name: "System",
      value: "system",
      icon: Monitor,
      description: "System preference",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative overflow-hidden group hover:bg-accent/80"
        >
          {/* Icon container with smooth transitions */}
          <div className="relative w-5 h-5">
            <Sun
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out",
                resolvedTheme === "dark"
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100",
              )}
            />
            <Moon
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out",
                resolvedTheme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0",
              )}
            />
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 p-2 bg-card/95 backdrop-blur-md border-border/50 shadow-xl animate-in slide-in-from-top-2 duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Theme
          </span>
        </div>

        <DropdownMenuSeparator className="mb-2" />

        {/* Theme options */}
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.value;

          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-accent/80 focus:bg-accent/80",
                isActive &&
                  "bg-primary/10 text-primary hover:bg-primary/15 focus:bg-primary/15",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/50 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {themeOption.name}
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {themeOption.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-2" />

        {/* Current status */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Currently using{" "}
              <span className="font-medium text-foreground">
                {resolvedTheme}
              </span>{" "}
              mode
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
