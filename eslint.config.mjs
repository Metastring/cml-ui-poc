import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Keep typography centralised in src/components/ui/typography.tsx.
    files: ["src/**/*.tsx"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXOpeningElement[name.name=/^(h[1-6]|p)$/]",
          message:
            "Use <Typography> from @/components/ui/typography instead of a raw heading/paragraph.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] :matches(Literal[value=/(^|\\s)text-\\[\\d/], TemplateElement[value.raw=/(^|\\s)text-\\[\\d/])",
          message:
            "Avoid one-off font sizes like text-[13px]; use a Typography variant or a --text-* token from globals.css.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] :matches(Literal[value=/(^|\\s)text-\\[#/], TemplateElement[value.raw=/(^|\\s)text-\\[#/])",
          message:
            "Avoid hard-coded text colours like text-[#6E7268]; use a theme colour or a Typography tone.",
        },
      ],
    },
  },
];

export default eslintConfig;
