const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Patito online: ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
