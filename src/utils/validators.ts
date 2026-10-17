import { DISCORD_ID_REGEX } from './regex.js';

export function isValidSnowflake(id: string): boolean {
  return DISCORD_ID_REGEX.test(id);
}

export function isValidHexColor(value: string): boolean {
  return /^#?[0-9a-f]{6}$/i.test(value);
}

export function isWithinLength(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}
