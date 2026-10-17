import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyRepository } from '../../database/repositories/economyRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';
import { randomInt } from '../../utils/mathUtils.js';

function drawCard(): number {
  const card = randomInt(1, 13);
  return Math.min(card, 10); // faces valem 10
}

function drawHand(): number[] {
  return [drawCard(), drawCard()];
}

function handValue(hand: number[]): number {
  return hand.reduce((sum, c) => sum + c, 0);
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Joga uma rodada simplificada de blackjack contra o bot.')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Valor a apostar').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const account = economyRepository.get(interaction.guild!.id, interaction.user.id);

    if (amount > account.balance) {
      await interaction.reply({ embeds: [errorEmbed('Saldo insuficiente.')], ephemeral: true });
      return;
    }

    const playerHand = drawHand();
    const dealerHand = drawHand();
    let playerTotal = handValue(playerHand);
    let dealerTotal = handValue(dealerHand);

    // Bot compra até 17 automaticamente (versão simplificada, sem "pedir carta" interativo)
    while (dealerTotal < 17) {
      dealerHand.push(drawCard());
      dealerTotal = handValue(dealerHand);
    }

    let won: boolean;
    let message: string;

    if (playerTotal > 21) {
      won = false;
      message = 'Você estourou 21!';
    } else if (dealerTotal > 21) {
      won = true;
      message = 'O dealer estourou! Você ganhou!';
    } else if (playerTotal > dealerTotal) {
      won = true;
      message = 'Você ganhou!';
    } else if (playerTotal < dealerTotal) {
      won = false;
      message = 'O dealer ganhou.';
    } else {
      won = false;
      message = 'Empate (a casa vence em empates).';
    }

    const delta = won ? amount : -amount;
    await economyRepository.update(interaction.guild!.id, interaction.user.id, { balance: account.balance + delta });

    const embed = successEmbed(
      `Sua mão: ${playerHand.join(', ')} (${playerTotal})\nMão do dealer: ${dealerHand.join(', ')} (${dealerTotal})\n\n${message} ${won ? `Ganhou ${formatCurrency(amount)}` : `Perdeu ${formatCurrency(amount)}`}.`,
      '🃏 Blackjack'
    );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
