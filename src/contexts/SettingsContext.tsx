"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface SettingsState {
  scrambleLength: number;
  showMilliseconds: boolean;
  timeFormat: "seconds" | "milliseconds";
  theme: "light" | "dark" | "system";
}

interface SettingsContextType extends SettingsState {
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  scrambleLength: 20,
  showMilliseconds: true,
  timeFormat: "seconds",
  theme: "system",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("rubiks-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("rubiks-settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [settings, isLoaded]);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("rubiks-settings");
  };

  const contextValue: SettingsContextType = {
    ...settings,
    updateSetting,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
