import type { CSSProperties } from "react";
import {
  THEME_FIELD_DEFINITIONS,
  type SiteTheme,
  type ThemeCssVariable,
} from "@/lib/site-theme";

type ThemeStyle = CSSProperties & Partial<Record<ThemeCssVariable, string>>;

export function buildThemeStyle(theme: SiteTheme): ThemeStyle {
  return THEME_FIELD_DEFINITIONS.reduce((style, definition) => {
    style[definition.cssVar] = theme[definition.name];
    return style;
  }, {} as ThemeStyle);
}
