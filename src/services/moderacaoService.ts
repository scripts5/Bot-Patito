import {
  Guild,
  GuildMember,
  PermissionsBitField,
  TextChannel,
  User,
} from 'discord.js';
import { caseService } from './caseService.js';
import { canModerate } from '../utils/permissionUtils.js';
import { config } from '../config.js';

export interface ModerationResult {
  ok: boolean;
  message: string;
  caseId?: number;
}

/**
 * Centraliza todas as ações de moderação (ban, kick, timeout, etc).
 * Sempre verifica hierarquia, permissões do bot e nunca finge sucesso se a API do Discord recusar.
 */
export const moderacaoService = {
  async ban(
    guild: Guild,
    actor: GuildMember,
    target: GuildMember | User,
    reason: string,
    deleteMessageSeconds = 0
  ): Promise<ModerationResult> {
    const targetMember = target instanceof GuildMember ? target : await guild.members.fetch(target.id).catch(() => null);

    if (targetMember) {
      const blocked = canModerate(actor, targetMember, config.OWNER_ID);
      if (blocked) return { ok: false, message: blocked };
    }

    const me = guild.members.me;
    if (!me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return { ok: false, message: 'Não tenho permissão de banir membros nesse servidor.' };
    }

    try {
      await guild.bans.create(target.id, { deleteMessageSeconds, reason });
    } catch (err) {
      return { ok: false, message: `O Discord recusou o banimento: ${(err as Error).message}` };
    }

    const moderationCase = await caseService.createCase(guild.id, 'ban', target.id, actor.id, reason);
    return { ok: true, message: `Usuário banido. Caso #${moderationCase.caseId}.`, caseId: moderationCase.caseId };
  },

  async unban(guild: Guild, actor: GuildMember, userId: string, reason: string): Promise<ModerationResult> {
    const me = guild.members.me;
    if (!me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return { ok: false, message: 'Não tenho permissão de banir/desbanir membros nesse servidor.' };
    }

    try {
      const bans = await guild.bans.fetch();
      if (!bans.has(userId)) {
        return { ok: false, message: 'Esse usuário não está banido.' };
      }
      await guild.bans.remove(userId, reason);
    } catch (err) {
      return { ok: false, message: `O Discord recusou o desbanimento: ${(err as Error).message}` };
    }

    const moderationCase = await caseService.createCase(guild.id, 'unban', userId, actor.id, reason);
    return { ok: true, message: `Usuário desbanido. Caso #${moderationCase.caseId}.`, caseId: moderationCase.caseId };
  },

  async kick(guild: Guild, actor: GuildMember, target: GuildMember, reason: string): Promise<ModerationResult> {
    const blocked = canModerate(actor, target, config.OWNER_ID);
    if (blocked) return { ok: false, message: blocked };

    const me = guild.members.me;
    if (!me?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return { ok: false, message: 'Não tenho permissão de expulsar membros nesse servidor.' };
    }

    try {
      await target.kick(reason);
    } catch (err) {
      return { ok: false, message: `O Discord recusou a expulsão: ${(err as Error).message}` };
    }

    const moderationCase = await caseService.createCase(guild.id, 'kick', target.id, actor.id, reason);
    return { ok: true, message: `Usuário expulso. Caso #${moderationCase.caseId}.`, caseId: moderationCase.caseId };
  },

  async timeout(
    guild: Guild,
    actor: GuildMember,
    target: GuildMember,
    durationMs: number,
    reason: string
  ): Promise<ModerationResult> {
    const blocked = canModerate(actor, target, config.OWNER_ID);
    if (blocked) return { ok: false, message: blocked };

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
      return { ok: false, message: 'O tempo máximo de timeout permitido pelo Discord é 28 dias.' };
    }

    const me = guild.members.me;
    if (!me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return { ok: false, message: 'Não tenho permissão de aplicar timeout nesse servidor.' };
    }

    try {
      await target.timeout(durationMs, reason);
    } catch (err) {
      return { ok: false, message: `O Discord recusou o timeout: ${(err as Error).message}` };
    }

    const moderationCase = await caseService.createCase(guild.id, 'timeout', target.id, actor.id, reason);
    return { ok: true, message: `Timeout aplicado. Caso #${moderationCase.caseId}.`, caseId: moderationCase.caseId };
  },

  async untimeout(guild: Guild, actor: GuildMember, target: GuildMember, reason: string): Promise<ModerationResult> {
    const me = guild.members.me;
    if (!me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return { ok: false, message: 'Não tenho permissão de remover timeout nesse servidor.' };
    }

    try {
      await target.timeout(null, reason);
    } catch (err) {
      return { ok: false, message: `O Discord recusou a remoção do timeout: ${(err as Error).message}` };
    }

    const moderationCase = await caseService.createCase(guild.id, 'untimeout', target.id, actor.id, reason);
    return { ok: true, message: `Timeout removido. Caso #${moderationCase.caseId}.`, caseId: moderationCase.caseId };
  },

  async purge(channel: TextChannel, amount: number, filter?: (msg: { author: User }) => boolean): Promise<ModerationResult> {
    const me = channel.guild.members.me;
    if (!me?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return { ok: false, message: 'Não tenho permissão de gerenciar mensagens nesse canal.' };
    }

    try {
      const messages = await channel.messages.fetch({ limit: Math.min(amount, 100) });
      const toDelete = filter ? messages.filter((m) => filter(m)) : messages;
      const deleted = await channel.bulkDelete(toDelete, true);
      return { ok: true, message: `${deleted.size} mensagem(ns) apagada(s).` };
    } catch (err) {
      return { ok: false, message: `Falha ao apagar mensagens: ${(err as Error).message}` };
    }
  },
};
