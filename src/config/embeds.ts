import { colors } from './colors.js';

export const embedTemplates = {
  footer: (botName: string) => ({ text: botName }),
  defaultColor: colors.primary,
};
