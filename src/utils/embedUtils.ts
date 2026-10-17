import { EmbedBuilder, User } from 'discord.js';
import { COLORS, EMOJIS } from './constants.js';

export function successEmbed(description: string, title?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setDescription(`${EMOJIS.success} ${description}`)
    .setTitle(title ?? null)
    .setTimestamp();
}

export function errorEmbed(description: string, title?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setDescription(`${EMOJIS.error} ${description}`)
    .setTitle(title ?? null)
    .setTimestamp();
}

export function infoEmbed(description: string, title?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setDescription(`${EMOJIS.info} ${description}`)
    .setTitle(title ?? null)
    .setTimestamp();
}

export function baseEmbed(author?: User): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(COLORS.primary).setTimestamp();
  if (author) {
    embed.setFooter({ text: author.username, iconURL: author.displayAvatarURL() });
  }
  return embed;
}
