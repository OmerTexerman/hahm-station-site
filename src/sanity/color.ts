interface SanityRgbaColor {
  _type?: "rgbaColor";
  r: number;
  g: number;
  b: number;
  a: number;
}

interface SanityHslaColor {
  _type?: "hslaColor";
  h: number;
  s: number;
  l: number;
  a: number;
}

interface SanityHsvaColor {
  _type?: "hsvaColor";
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface SanityColorValue {
  _type?: "color";
  hex?: string | null;
  alpha?: number | null;
  hsl?: SanityHslaColor | null;
  hsv?: SanityHsvaColor | null;
  rgb?: SanityRgbaColor | null;
}

export type SanityColorSource = string | SanityColorValue | null | undefined;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 4) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function rgbComponentToHex(value: number) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
}

function rgbaToHex(r: number, g: number, b: number) {
  return `#${rgbComponentToHex(r)}${rgbComponentToHex(g)}${rgbComponentToHex(b)}`;
}

function parseHexColor(value: string) {
  const normalized = value.trim().replace(/^#/, "");

  if (![3, 4, 6, 8].includes(normalized.length)) {
    return null;
  }

  const expanded =
    normalized.length === 3 || normalized.length === 4
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  const hasAlpha = expanded.length === 8;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  const a = hasAlpha
    ? round(Number.parseInt(expanded.slice(6, 8), 16) / 255, 3)
    : 1;

  if ([r, g, b].some((component) => Number.isNaN(component))) {
    return null;
  }

  return { r, g, b, a };
}

function parseRgbFunction(value: string) {
  const match = value
    .trim()
    .match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);

  if (!match) {
    return null;
  }

  const r = Number.parseFloat(match[1]);
  const g = Number.parseFloat(match[2]);
  const b = Number.parseFloat(match[3]);
  const a = match[4] ? Number.parseFloat(match[4]) : 1;

  if ([r, g, b, a].some((component) => Number.isNaN(component))) {
    return null;
  }

  return {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
    a: clamp(a, 0, 1),
  };
}

function rgbToHsl(r: number, g: number, b: number, alpha = 1): SanityHslaColor {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue *= 60;
  }

  return {
    _type: "hslaColor",
    h: round(hue, 6),
    s: round(saturation, 6),
    l: round(lightness, 6),
    a: round(alpha, 3),
  };
}

function rgbToHsv(r: number, g: number, b: number, alpha = 1): SanityHsvaColor {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue *= 60;
  }

  return {
    _type: "hsvaColor",
    h: round(hue, 6),
    s: round(max === 0 ? 0 : delta / max, 6),
    v: round(max, 6),
    a: round(alpha, 3),
  };
}

function createSanityColorValue(
  r: number,
  g: number,
  b: number,
  alpha = 1
): SanityColorValue {
  const normalizedAlpha = clamp(alpha, 0, 1);

  return {
    _type: "color",
    hex: rgbaToHex(r, g, b),
    alpha: round(normalizedAlpha, 3),
    rgb: {
      _type: "rgbaColor",
      r: Math.round(clamp(r, 0, 255)),
      g: Math.round(clamp(g, 0, 255)),
      b: Math.round(clamp(b, 0, 255)),
      a: round(normalizedAlpha, 3),
    },
    hsl: rgbToHsl(r, g, b, normalizedAlpha),
    hsv: rgbToHsv(r, g, b, normalizedAlpha),
  };
}

export function parseCssColor(value: string): SanityColorValue | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed =
    trimmed.startsWith("#") ? parseHexColor(trimmed) : parseRgbFunction(trimmed);

  if (!parsed) {
    return null;
  }

  return createSanityColorValue(parsed.r, parsed.g, parsed.b, parsed.a);
}

export function sanityColorToCss(
  value: SanityColorSource,
  fallback: string
): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (!value) {
    return fallback;
  }

  const alpha = clamp(
    value.alpha ??
      value.rgb?.a ??
      value.hsl?.a ??
      value.hsv?.a ??
      1,
    0,
    1
  );

  if (value.rgb) {
    const { r, g, b } = value.rgb;

    if (alpha < 1) {
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(alpha, 3)})`;
    }

    return value.hex?.trim() || `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  if (value.hex?.trim()) {
    return value.hex.trim();
  }

  return fallback;
}
