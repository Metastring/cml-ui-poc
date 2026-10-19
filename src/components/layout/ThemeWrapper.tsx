"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore, THEME_IDS } from "@/store/theme_store/useThemeStore";

const THEME_CLASSES = THEME_IDS.filter((t) => t !== "default") as string[];

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const textSize = useThemeStore((s) => s.textSize);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Apply theme to document so portaled content (dropdowns, popovers) inherits it
  useEffect(() => {
    const html = document.documentElement;
    THEME_CLASSES.forEach((c) => html.classList.remove(c));
    if (theme !== "default") html.classList.add(theme);
  }, [theme]);

  // Scales all font-size tokens in globals.css; "medium" is the default size
  useEffect(() => {
    const html = document.documentElement;
    if (textSize === "medium") html.removeAttribute("data-text-size");
    else html.setAttribute("data-text-size", textSize);
  }, [textSize]);

  const themeClass = theme === "default" ? "" : theme === "dark" ? "dark" : theme;
  const bgClass = theme === "default" ? "bg-gray-100" : "bg-background";

  return (
    <div className={`flex h-screen w-full overflow-hidden ${bgClass} ${themeClass}`}>
      {children}
    </div>
  );
}
