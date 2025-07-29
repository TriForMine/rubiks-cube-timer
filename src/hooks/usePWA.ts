"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    installPrompt: null,
  });

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
      document.referrer.includes("android-app://");

    // Check if already installed via other means
    const isInstalled =
      isStandalone || localStorage.getItem("pwa-installed") === "true";

    setState((prev) => ({
      ...prev,
      isStandalone,
      isInstalled,
    }));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;

      setState((prev) => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent,
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));

      localStorage.setItem("pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const choiceResult = await state.installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setState((prev) => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error installing PWA:", error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setState((prev) => ({
      ...prev,
      isInstallable: false,
      installPrompt: null,
    }));
  };

  return {
    ...state,
    installApp,
    dismissInstallPrompt,
    canInstall: state.isInstallable && !state.isInstalled,
  };
}
