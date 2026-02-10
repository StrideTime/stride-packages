import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import { type ReactNode, createContext, useContext, useState, useMemo } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  mode?: "light" | "dark";
}

interface ThemeContextValue {
  mode: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children, mode: initialMode = "light" }: ThemeProviderProps) {
 const [mode, setMode] = useState<"light" | "dark">(initialMode);

 const theme = mode === "dark" ? darkTheme : lightTheme;

 const contextValue = useMemo(
   () => ({
     mode,
     toggleTheme: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
   }),
   [mode]
 );

 return (
  <ThemeContext.Provider value={contextValue}>
    <MuiThemeProvider theme={theme}>
     <CssBaseline />
     {children}
    </MuiThemeProvider>
  </ThemeContext.Provider>
 );
}
