import { createContext } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);
