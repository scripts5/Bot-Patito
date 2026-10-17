export const DISCORD_ID_REGEX = /^\d{17,20}$/;
export const USER_MENTION_REGEX = /^<@!?(\d{17,20})>$/;
export const ROLE_MENTION_REGEX = /^<@&(\d{17,20})>$/;
export const CHANNEL_MENTION_REGEX = /^<#(\d{17,20})>$/;
export const INVITE_LINK_REGEX = /(discord\.gg|discord(?:app)?\.com\/invite)\/([a-zA-Z0-9-]+)/i;
export const URL_REGEX = /https?:\/\/[^\s]+/gi;
export const EMOJI_CUSTOM_REGEX = /<a?:\w+:\d+>/g;

export function extractId(mentionOrId: string): string | null {
  if (DISCORD_ID_REGEX.test(mentionOrId)) return mentionOrId;
  const match =
    mentionOrId.match(USER_MENTION_REGEX) ||
    mentionOrId.match(ROLE_MENTION_REGEX) ||
    mentionOrId.match(CHANNEL_MENTION_REGEX);
  return match ? match[1] : null;
}
