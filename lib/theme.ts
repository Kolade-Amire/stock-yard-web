export const THEME_STORAGE_KEY = "stock-yard:theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type ThemeName = "light" | "dark";

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "light" || value === "dark";
}

export function resolveTheme(preference: ThemeName | null, prefersDark: boolean): ThemeName {
  if (preference !== null) {
    return preference;
  }

  return prefersDark ? "dark" : "light";
}

export function getSystemTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia(THEME_MEDIA_QUERY).matches ? "dark" : "light";
}

export function readStoredThemePreference(): ThemeName | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredThemePreference(preference: ThemeName | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (preference === null) {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore storage failures and keep runtime theme switching functional.
  }
}

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function getThemeBootstrapScript() {
  return `(() => {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    const mediaQuery = ${JSON.stringify(THEME_MEDIA_QUERY)};
    const root = document.documentElement;
    let stored = null;

    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {}

    const theme = stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia(mediaQuery).matches
        ? "dark"
        : "light";

    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  })();`;
}
