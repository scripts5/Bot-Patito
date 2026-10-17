import { ButtonHandlerModule } from '../../types/button.js';
import { playerService } from '../../services/playerService.js';
import { musicService } from '../../services/musicService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const pause: ButtonHandlerModule = {
  customId: 'music_pause',
  async execute(interaction) {
    if (!interaction.guild) return;
    const ok = playerService.pause(interaction.guild.id);
    await interaction.reply({ embeds: [ok ? successEmbed('Música pausada.') : errorEmbed('Nada tocando.')], ephemeral: true });
  },
};

const resume: ButtonHandlerModule = {
  customId: 'music_resume',
  async execute(interaction) {
    if (!interaction.guild) return;
    const ok = playerService.resume(interaction.guild.id);
    await interaction.reply({ embeds: [ok ? successEmbed('Música retomada.') : errorEmbed('Nada pausado.')], ephemeral: true });
  },
};

const skip: ButtonHandlerModule = {
  customId: 'music_skip',
  async execute(interaction) {
    if (!interaction.guild) return;
    await musicService.playNext(interaction.guild.id);
    await interaction.reply({ embeds: [successEmbed('Música pulada.')], ephemeral: true });
  },
};

const stop: ButtonHandlerModule = {
  customId: 'music_stop',
  async execute(interaction) {
    if (!interaction.guild) return;
    musicService.leave(interaction.guild.id);
    await interaction.reply({ embeds: [successEmbed('Reprodução encerrada e fila limpa.')], ephemeral: true });
  },
};

export default [pause, resume, skip, stop];
