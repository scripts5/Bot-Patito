import { Guild, GuildMember, Role } from 'discord.js';
import { serverConfigService } from './serverConfigService.js';
import { logger } from '../utils/logger.js';

export const roleService = {
  async applyAutorole(member: GuildMember): Promise<void> {
    const settings = serverConfigService.getSettings(member.guild.id);
    if (!settings.autoroleId) return;

    const role = member.guild.roles.cache.get(settings.autoroleId);
    if (!role) return;

    try {
      await member.roles.add(role, 'Autorole ao entrar no servidor');
    } catch (err) {
      logger.error('roleService', `Falha ao aplicar autorole em ${member.id}: ${err}`);
    }
  },

  async createRole(guild: Guild, name: string, color?: number): Promise<Role | null> {
    const existing = guild.roles.cache.find((r) => r.name === name);
    if (existing) return existing;

    try {
      return await guild.roles.create({ name, color, reason: 'Criado via Patito' });
    } catch (err) {
      logger.error('roleService', `Falha ao criar cargo "${name}": ${err}`);
      return null;
    }
  },

  async addRole(member: GuildMember, role: Role, reason = 'Ação do Patito'): Promise<boolean> {
    try {
      await member.roles.add(role, reason);
      return true;
    } catch {
      return false;
    }
  },

  async removeRole(member: GuildMember, role: Role, reason = 'Ação do Patito'): Promise<boolean> {
    try {
      await member.roles.remove(role, reason);
      return true;
    } catch {
      return false;
    }
  },
};
