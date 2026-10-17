import { Guild, TextChannel } from 'discord.js';
import { config } from '../config.js';
import { serverConfigService } from './serverConfigService.js';
import { serverProposalService } from './serverProposalService.js';
import { buildProposalMessage } from './serverProposalView.js';
import { logger } from '../utils/logger.js';

/**
 * Auto-configuração em dois tempos: o Patito escaneia o servidor, monta uma PROPOSTA e a envia
 * ao dono. Nada é alterado no servidor até o dono aprovar (menu de itens + botão "Aplicar").
 * Roda uma vez por servidor (settings.autoConfigProposed / autoConfigured). Para reanalisar
 * depois, use /autoconfig analisar.
 */
export const autoConfigService = {
  async run(guild: Guild): Promise<void> {
    const current = serverConfigService.getSettings(guild.id);
    if (current.autoConfigured || current.autoConfigProposed) return;

    logger.info('autoConfigService', `Analisando "${guild.name}" (${guild.id}) para montar a proposta...`);
    const proposal = await serverProposalService.build(guild);
    const message = buildProposalMessage(proposal);

    if (await this.deliver(guild, message)) {
      await serverConfigService.update(guild.id, { autoConfigProposed: true });
      logger.info('autoConfigService', `Proposta ${proposal.id} enviada ao dono. Aguardando aprovação.`);
    } else {
      logger.warn('autoConfigService', `Não consegui entregar a proposta de ${guild.id}. Use /autoconfig analisar.`);
    }
  },

  /** Tenta a DM do dono (a proposta lista detalhes do servidor); se estiver fechada, cai no canal de sistema. */
  async deliver(guild: Guild, message: ReturnType<typeof buildProposalMessage>): Promise<boolean> {
    try {
      const owner = await guild.client.users.fetch(config.OWNER_ID);
      await owner.send(message);
      return true;
    } catch (err) {
      logger.warn('autoConfigService', `DM ao dono falhou (${err}). Tentando o canal do servidor.`);
    }

    const me = guild.members.me;
    const target =
      guild.systemChannel ??
      (guild.channels.cache.find((c) => c.type === 0 && me !== null && c.permissionsFor(me)?.has('SendMessages')) as TextChannel | undefined);
    if (!target) return false;

    try {
      await target.send(message);
      return true;
    } catch (err) {
      logger.error('autoConfigService', `Não consegui enviar a proposta em ${guild.id}: ${err}`);
      return false;
    }
  },
};
