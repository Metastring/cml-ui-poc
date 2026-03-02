"use client";

import { useThemeStore, type ThemeId } from "@/store/theme_store/useThemeStore";
import { cn } from "@/lib/utils";

const themes: { id: ThemeId; label: string; description: string }[] = [
  { id: "default", label: "Default", description: "System default light theme" },
  { id: "dark", label: "Dark", description: "Dark mode" },
  { id: "observatory", label: "Observatory", description: "Deep Observatory Blue & Earth Accent" },
  { id: "mountain", label: "Mountain", description: "Slate blues and soft sage" },
  { id: "grassland", label: "Grassland", description: "Olive greens and wheat" },
  { id: "journal", label: "Journal", description: "Navy and steel grey" },
  { id: "tropical", label: "Tropical", description: "Forest greens and mint" },
  { id: "moss", label: "Moss", description: "Deep green and sage" },
  { id: "ocean", label: "Ocean", description: "Blues and aqua" },
  { id: "sunset", label: "Sunset", description: "Violet and lavender" },
  { id: "wetland", label: "Wetland", description: "Dark teal and cyan" },
  { id: "forest", label: "Forest", description: "Green with brown accent" },
  { id: "earth", label: "Earth", description: "Brown and clay" },
  { id: "bluegreen", label: "Blue Green", description: "Teal and material green" },
  { id: "botanical", label: "Botanical", description: "Fresh green and lime" },
  { id: "conservation", label: "Conservation", description: "Deep green and warm accent" },
  { id: "emerald", label: "Emerald", description: "Emerald green" },
  { id: "coral", label: "Coral", description: "Coral and rose" },
  { id: "amber", label: "Amber", description: "Amber and gold" },
  { id: "slate", label: "Slate", description: "Blue-grey slate" },
  { id: "lavender", label: "Lavender", description: "Soft lavender purple" },
];

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <section>
        <h2 className="text-lg font-medium mb-4">Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "text-left p-4 rounded-lg border transition w-full",
                theme === t.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <span className="font-medium">{t.label}</span>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
