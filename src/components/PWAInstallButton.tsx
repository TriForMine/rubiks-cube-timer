"use client";

import { useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallButton() {
  const { canInstall, installApp, dismissInstallPrompt, isStandalone } = usePWA();
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
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
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
                onClick={handleInstall}
                disabled={isInstalling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-3 w-3" />
                {isInstalling ? "Installing..." : "Install"}
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
