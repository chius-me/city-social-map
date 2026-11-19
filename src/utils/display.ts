import type { Character, Locale } from "../types";
import { pickText } from "../data/i18n";

export function getDisplayMapName(
  char: Character,
  locale: Locale,
  spoilerFree: boolean
): string {
  if (spoilerFree && char.spoilerSafeName) {
    return pickText(char.spoilerSafeName, locale);
  }
  return pickText(char.mapName, locale);
}

export function getDisplayFullName(
  char: Character,
  locale: Locale,
  spoilerFree: boolean
): string {
  if (spoilerFree && char.spoilerSafeName) {
    return pickText(char.spoilerSafeName, locale);
  }
  return pickText(char.fullName, locale);
}

export function getDisplayBio(
  char: Character,
  locale: Locale,
  spoilerFree: boolean
): string {
  if (spoilerFree && char.spoilerSafeBio) {
    return pickText(char.spoilerSafeBio, locale);
  }
  return pickText(char.bio, locale);
}

export function getDisplayTagline(
  char: Character,
  locale: Locale,
  spoilerFree: boolean
): string | undefined {
  if (!char.tagline) return undefined;
  if (spoilerFree && char.hasSpoiler) return undefined;
  return pickText(char.tagline, locale);
}

export function getDisplayBadge(
  char: Character,
  spoilerFree: boolean
): string | undefined {
  if (!char.badge) return undefined;
  if (spoilerFree && char.id === "naganohara") return undefined;
  return char.badge;
}
