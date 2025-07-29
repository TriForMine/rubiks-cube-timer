import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TimeFormatSettings {
  showMilliseconds?: boolean;
  precision?: number;
}

export function formatTime(
  milliseconds: number,
  settings?: TimeFormatSettings,
): string {
  if (milliseconds < 0) return "0.00";

  const { showMilliseconds = true, precision = 2 } = settings || {};
  const decimals = showMilliseconds ? precision : 2;
  const seconds = milliseconds / 1000;

  if (seconds < 60) {
    return seconds.toFixed(decimals);
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed(decimals).padStart(decimals + 3, "0")}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toFixed(decimals).padStart(decimals + 3, "0")}`;
  }
}

export function formatTimeWithSettings(
  milliseconds: number,
  showMilliseconds: boolean = true,
  timeFormat: string = "seconds",
): string {
  const precision = timeFormat === "milliseconds" ? 3 : 2;
  return formatTime(milliseconds, { showMilliseconds, precision });
}

export function calculateAverage(
  times: number[],
  count: number,
): number | null {
  if (times.length < count) return null;

  const recentTimes = times.slice(0, count);
  const sum = recentTimes.reduce((acc, time) => acc + time, 0);
  return sum / count;
}

export function calculateAverageOf(
  times: number[],
  count: number,
): number | null {
  if (times.length < count) return null;

  // For averages like Ao5, Ao12, remove best and worst times
  const recentTimes = times.slice(0, count);
  const sortedTimes = [...recentTimes].sort((a, b) => a - b);

  if (count <= 3) {
    // For small counts, don't remove any times
    return calculateAverage(recentTimes, count);
  }

  // Remove best and worst times
  const trimmedTimes = sortedTimes.slice(1, -1);
  const sum = trimmedTimes.reduce((acc, time) => acc + time, 0);
  return sum / trimmedTimes.length;
}

export function getBestTime(times: number[]): number | null {
  if (times.length === 0) return null;
  return Math.min(...times);
}

export function getWorstTime(times: number[]): number | null {
  if (times.length === 0) return null;
  return Math.max(...times);
}

export function calculateStatistics(times: number[]) {
  const validTimes = times.filter((time) => time > 0);

  return {
    count: validTimes.length,
    best: getBestTime(validTimes),
    worst: getWorstTime(validTimes),
    mean: calculateAverage(validTimes, validTimes.length),
    ao5: calculateAverageOf(validTimes, 5),
    ao12: calculateAverageOf(validTimes, 12),
    ao50: calculateAverageOf(validTimes, 50),
    ao100: calculateAverageOf(validTimes, 100),
  };
}

export function exportTimes(times: unknown[]) {
  const dataStr = JSON.stringify(times, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `rubiks_times_${new Date().toISOString().split("T")[0]}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

export function importTimes(file: File): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function getTimeColor(time: number, best: number | null): string {
  if (!best) return "text-white";

  const ratio = time / best;

  if (ratio <= 1.1) return "text-green-400";
  if (ratio <= 1.25) return "text-yellow-400";
  if (ratio <= 1.5) return "text-orange-400";
  return "text-red-400";
}
