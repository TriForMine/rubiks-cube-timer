"use client";

import { useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallButton() {
  const { canInstall, installApp, dismissInstallPrompt, isStandalone } =
    usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  if (!canInstall || !showBanner || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setShowBanner(false);
      }
    } catch (error) {
      console.error("Installation failed:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    dismissInstallPrompt();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm pointer-events-auto">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-auto animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Install Cube Timer
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Install this app for quick access and offline use
            </p>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstall}
                onTouchStart={() => {}} // Enable mobile hover states
                disabled={isInstalling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 hover:scale-105 active:scale-95 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 select-none touch-manipulation"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <Download className="h-3 w-3" />
                {isInstalling ? "Installing..." : "Install"}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                onTouchStart={() => {}} // Enable mobile hover states
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70 rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 select-none hover:scale-105 active:scale-95 touch-manipulation"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Not now
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            onTouchStart={() => {}} // Enable mobile hover states
            className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70 rounded-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover:scale-110 active:scale-95 select-none touch-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
