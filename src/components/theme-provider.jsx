"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider(props) {
  const { children } = props;
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}