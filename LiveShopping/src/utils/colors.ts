export const Colors = {
  light: {
    background: "#FFFFFF",
    surface: "#F2F2F2",
    primary: "#4968F4",
    text: "#11181C",
    placeholder: "#999999",
    border: "#E0E0E0",
    error: "#DC2626",
  },
  dark: {
    background: "#121212",
    surface: "#1E1E1E",
    primary: "#4D85FF",
    text: "#ECECEE",
    placeholder: "#AAAAAA",
    border: "#333333",
    error: "#FF6B6B",
  },
} as const;

export type ThemeColors = typeof Colors.light;
