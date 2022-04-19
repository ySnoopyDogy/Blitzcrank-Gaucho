const { EmbedBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder, ChatInputCommandInteraction, ButtonStyle, TextInputStyle } = require('discord.js')

module.exports = {
  config: {
    name: 'mensagem',
    description: 'Cria a Mensagem de entrada de novos usuários',
    options: [
      {
        type: 7,
        name: 'canal',
        description: 'Canal que a mensagem será enviada!',
        required: true,
        channel_types: [0],
      },
      {
        type: 11,
        name: 'imagem',
        description: 'Imagem que você quer que apareça no fim da Imagem',
        required: false,
      },
    ],
  },

  /**
  * @param {ChatInputCommandInteraction<'cached'>} interaction
  */
  async execute(interaction) {
    const channel = interaction.options.getChannel('canal', true)
    const imagem = interaction.options.getAttachment('imagem')

    if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE)) return interaction.reply({ content: `Você não tem o cargo <@&${process.env.ADMIN_ROLE}> para fazer isso!`, ephemeral: true })

    const titleInput = new TextInputBuilder()
      .setLabel('Título')
      .setCustomId('title')
      .setMinLength(1)
      .setValue('Bem Vindos, Gaúchos')
      .setPlaceholder('Eae familia do mais bah')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(50)
      .setRequired(true)

    const descriptionInput = new TextInputBuilder()
      .setLabel('Descrição')
      .setCustomId('description')
      .setMinLength(1)
      .setValue(`Este é o servidor dos jogadores Gaúchos de League of Legends
      \n\nClique no botão abaixo para dizer - nos qual é o seu mono`)
      .setPlaceholder('Clica no botao ae que é sucesso')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(4000)
      .setRequired(true)

    const modal = new ModalBuilder().setTitle('Criação da Mensagem').setCustomId(`${interaction.id} MODAL`)
      .addComponents({ type: 1, components: [titleInput] }, { type: 1, components: [descriptionInput] })

    interaction.showModal(modal).catch(() => null)

    const filter = (int) => int.customId.startsWith(interaction.id)

    const collected = await interaction.awaitModalSubmit({ time: 60_000, filter }).catch(() => null)

    if (!collected) return

    collected.reply({ content: 'Mensagem enviada!', ephemeral: true }).catch(() => null)

    const title = collected.fields.getField('title')
    const description = collected.fields.getField('description')

    const embed = new EmbedBuilder().setTitle(title.value)
      .setColor('#b17ef0')
      .setDescription(description.value)

    if (imagem) embed.setImage(imagem.url)

    const button = new ButtonBuilder()
      .setCustomId('REGISTER')
      .setLabel('Registrar Campeão')
      .setStyle(ButtonStyle.Primary)

    channel.send({ embeds: [embed], components: [{ type: 1, components: [button] }] }).catch(() => null)
  }
}