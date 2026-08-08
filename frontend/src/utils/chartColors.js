import { useTheme } from "../hooks/useTheme";

const DARK = {
  primary: "#818cf8",
  secondary: "#34d399",
  accent: "#f87171",
  warning: "#fb923c",
  grid: "#3f3f46",
  text: "#a1a1aa",
};

const LIGHT = {
  primary: "#4f46e5",
  secondary: "#059669",
  accent: "#dc2626",
  warning: "#ea580c",
  grid: "#d4d4d8",
  text: "#52525b",
};

export function useChartColors() {
  const { theme } = useTheme();
  return theme === "light" ? LIGHT : DARK;
}
