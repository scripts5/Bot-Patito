import { ChannelType, Guild, GuildMember, OverwriteResolvable, PermissionFlagsBits, TextChannel } from 'discord.js';
import { ticketRepository } from '../database/repositories/ticketRepository.js';
import { serverConfigService } from './serverConfigService.js';
import { botConfig } from '../config/botConfig.js';
import { logger } from '../utils/logger.js';

export const ticketService = {
  async canOpen(guildId: string, userId: string): Promise<string | null> {
    const openCount = ticketRepository.countOpenByUser(guildId, userId);
    if (openCount >= botConfig.ticketsPerUserLimit) {
      return `Você já tem ${openCount} ticket(s) aberto(s). Limite: ${botConfig.ticketsPerUserLimit}.`;
    }
    return null;
  },

  async openTicket(guild: Guild, author: GuildMember, reason: string | null) {
    const settings = serverConfigService.getSettings(guild.id);

    const overwrites: OverwriteResolvable[] = [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: author.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ];

    if (settings.ticketSupportRoleId) {
      overwrites.push({
        id: settings.ticketSupportRoleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }

    let channel: TextChannel;
    try {
      channel = await guild.channels.create({
        name: `ticket-${author.user.username}`,
        type: ChannelType.GuildText,
        parent: settings.ticketCategoryId ?? undefined,
        permissionOverwrites: overwrites,
        reason: 'Abertura de ticket',
      });
    } catch (err) {
      logger.error('ticketService', `Falha ao criar canal de ticket: ${err}`);
      throw new Error('Não foi possível criar o canal do ticket. Verifique minhas permissões.');
    }

    const ticket = await ticketRepository.create(guild.id, channel.id, author.id, reason);
    return { ticket, channel };
  },

  async claim(channelId: string, staffId: string) {
    return ticketRepository.update(channelId, { claimedBy: staffId, status: 'claimed' });
  },

  async unclaim(channelId: string) {
    return ticketRepository.update(channelId, { claimedBy: null, status: 'open' });
  },

  async close(channelId: string, closedBy: string) {
    return ticketRepository.close(channelId, closedBy);
  },

  async addMember(channel: TextChannel, memberId: string) {
    await channel.permissionOverwrites.edit(memberId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
    const ticket = ticketRepository.getByChannel(channel.id);
    if (!ticket) return null;
    const members = [...new Set([...ticket.members, memberId])];
    return ticketRepository.update(channel.id, { members });
  },

  async removeMember(channel: TextChannel, memberId: string) {
    await channel.permissionOverwrites.delete(memberId);
    const ticket = ticketRepository.getByChannel(channel.id);
    if (!ticket) return null;
    const members = ticket.members.filter((id) => id !== memberId);
    return ticketRepository.update(channel.id, { members });
  },
};
