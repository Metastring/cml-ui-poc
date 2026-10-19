"use client";

import { useThemeStore, type ThemeId, type TextSizeId } from "@/store/theme_store/useThemeStore";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";

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

// sampleSize is fixed (not scaled) so each option previews its own size
const textSizes: { id: TextSizeId; label: string; description: string; sampleSize: string }[] = [
  { id: "small", label: "Small", description: "Compact text", sampleSize: "14px" },
  { id: "medium", label: "Medium", description: "Default text size", sampleSize: "17.5px" },
  { id: "large", label: "Large", description: "Largest text, easier to read", sampleSize: "18.9px" },
];

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const textSize = useThemeStore((s) => s.textSize);
  const setTextSize = useThemeStore((s) => s.setTextSize);

  return (
    <div className="p-6 w-full">
      <Typography variant="h3" as="h1" className="text-2xl mb-6">Settings</Typography>
      <section className="mb-8">
        <Typography variant="h3" as="h2" weight="medium" className="mb-4">Text size</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl" role="radiogroup" aria-label="Text size">
          {textSizes.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={textSize === t.id}
              onClick={() => setTextSize(t.id)}
              className={cn(
                "text-left p-4 rounded-lg border transition w-full",
                textSize === t.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <Typography variant="inherit" as="span" weight="medium">{t.label}</Typography>
                <span aria-hidden className="font-semibold leading-none" style={{ fontSize: t.sampleSize }}>Aa</span>
              </span>
              <Typography variant="body" tone="muted" className="mt-1">{t.description}</Typography>
            </button>
          ))}
        </div>
      </section>
      <section>
        <Typography variant="h3" as="h2" weight="medium" className="mb-4">Theme</Typography>
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
              <Typography variant="inherit" as="span" weight="medium">{t.label}</Typography>
              <Typography variant="body" tone="muted" className="mt-1">{t.description}</Typography>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
