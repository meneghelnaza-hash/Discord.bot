const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

let filas = {};
const VALORES = [1, 2, 3, 5, 10, 15, 20, 25, 50, 100, 150, 200];

client.on('ready', async () => {
  console.log(`BOT ON: ${client.user.tag}`);
  const commands = [
    new SlashCommandBuilder()
      .setName('criar-fila')
      .setDescription('Cria filas de aposta')
      .addStringOption(o => o.setName('modo').setDescription('Mobile, Emulador, Misto').setRequired(true).addChoices({name:'Mobile', value:'Mobile'}, {name:'Emulador', value:'Emulador'}, {name:'Misto', value:'Misto'}))
      .addStringOption(o => o.setName('formato').setDescription('1v1, 2v2, 3v3, 4v4').setRequired(true).addChoices({name:'1v1', value:'1v1'}, {name:'2v2', value:'2v2'}, {name:'3v3', value:'3v3'}, {name:'4v4', value:'4v4'}))
  ].map(c => c.toJSON());
  
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log('Comando /criar-fila registrado!');
});

function getSlots(formato) {
  if (formato === '1v1') return 2;
  if (formato === '2v2') return 4;
  if (formato === '3v3') return 6;
  if (formato === '4v4') return 8;
  return 2;
}

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'criar-fila') {
    await interaction.deferReply({ ephemeral: true });
    const modo = interaction.options.getString('modo');
    const formato = interaction.options.getString('formato');
    const slots = getSlots(formato);

    for (const valor of VALORES) {
      const idFila = `${modo}_${formato}_${valor}`;
      filas[idFila] = filas[idFila] || [];
      let lista = '';
      for (let i = 1; i <= slots; i++) lista += `${i}.  (aguardando)\n`;

      const embed = new EmbedBuilder()
        .setTitle(`${formato} ${modo} - R$ ${valor},00`)
        .setDescription(`Jogadores\n\n${lista}`)
        .setColor('#2b2d31');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`entrar_${idFila}`).setLabel('Entrar na Fila').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId(`sair_${idFila}`).setLabel('Sair').setStyle(ButtonStyle.Danger)
      );
      await interaction.channel.send({ embeds: [embed], components: [row] });
    }
    await interaction.editReply(`✅ Criei ${VALORES.length} filas de **${formato} ${modo}**!`);
  }

  if (interaction.isButton()) {
    const [acao, ...resto] = interaction.customId.split('_');
    const idFila = resto.join('_');
    const [modo, formato, valor] = idFila.split('_');
    const slots = getSlots(formato);
    if (!filas[idFila]) filas[idFila] = [];

    if (acao === 'entrar') {
      if (filas[idFila].includes(interaction.user.id)) return interaction.reply({ content: `Você já tá nessa fila!`, ephemeral: true });
      if (filas[idFila].length >= slots) return interaction.reply({ content: `Fila cheia!`, ephemeral: true });
      filas[idFila].push(interaction.user.id);
      let lista = '';
      for (let i = 0; i < slots; i++) lista += `${i+1}.  ${filas[idFila][i] ? `<@${filas[idFila][i]}>` : '(aguardando)'}\n`;
      const novoEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`Jogadores\n\n${lista}`);
      await interaction.message.edit({ embeds: [novoEmbed] });
      if (filas[idFila].length === slots) {
        await interaction.reply({ content: `🔥 **FILOU!** ${formato} ${modo} R$${valor} - ${filas[idFila].map(id => `<@${id}>`).join(' ')}` });
        filas[idFila] = [];
      } else {
        await interaction.reply({ content: `Entrou R$${valor} (${filas[idFila].length}/${slots})`, ephemeral: true });
      }
    }
    if (acao === 'sair') {
      filas[idFila] = filas[idFila].filter(id => id !== interaction.user.id);
      let lista = '';
      for (let i = 0; i < slots; i++) lista += `${i+1}.  ${filas[idFila][i] ? `<@${filas[idFila][i]}>` : '(aguardando)'}\n`;
      const novoEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`Jogadores\n\n${lista}`);
      await interaction.message.edit({ embeds: [novoEmbed] });
      await interaction.reply({ content: `Saiu da fila`, ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
