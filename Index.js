const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`BOT ON: ${client.user.tag} - Fica ON pra sempre!`);
});

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return;
  if (msg.content.toLowerCase() === '!ping') {
    msg.reply('🏓 Pong! Bot tá ON 24h no Render!');
  }
});

client.login(process.env.TOKEN);
