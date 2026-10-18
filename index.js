import express from 'express';
import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } from 'discord.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot ON - Naza`s World'));
app.listen(PORT, () => console.log('Servidor web ON na porta ' + PORT));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

let filas = [];

client.once('ready', async () => {
  console.log(`Logado como ${client.user.tag}`);
  const commands = [
    new SlashCommandBuilder().setName('criar-fila').setDescription('Cria a fila de partidas').toJSON()
  ];
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log('Comandos registrados');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
  
  if (interaction.commandName === 'criar-fila') {
    filas = [];
    const embed = new EmbedBuilder().setTitle('🎮 FILA - Naza`s World').setDescription('Ninguém na fila ainda. Clique para entrar!').setColor(0x00FF00);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('entrar').setLabel('Entrar na Fila').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('sair').setLabel('Sair da Fila').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('iniciar').setLabel('Iniciar Partida').setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }

  if (interaction.isButton()) {
    const user = interaction.user;
    if (interaction.customId === 'entrar') {
      if (!filas.includes(user.id)) filas.push(user.id);
    } else if (interaction.customId === 'sair') {
      filas = filas.filter(id => id !== user.id);
    } else if (interaction.customId === 'iniciar') {
      if (filas.length === 0) return interaction.reply({ content: 'Fila vazia!', ephemeral: true });
      await interaction.reply({ content: `Partida iniciada com ${filas.map(id => `<@${id}>`).join(', ')}` });
      filas = [];
      return;
    }
    const desc = filas.length > 0 ? filas.map(id => `<@${id}>`).join('\n') : 'Ninguém na fila ainda. Clique para entrar!';
    const embed = new EmbedBuilder().setTitle('🎮 FILA - Naza`s World').setDescription(desc).setColor(0x00FF00);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('entrar').setLabel('Entrar na Fila').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('sair').setLabel('Sair da Fila').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('iniciar').setLabel('Iniciar Partida').setStyle(ButtonStyle.Primary)
    );
    await interaction.update({ embeds: [embed], components: [row] });
  }
});

client.login(process.env.TOKEN);
