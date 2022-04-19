const { ButtonBuilder } = require('@discordjs/builders')
const { ChatInputCommandInteraction, ButtonStyle } = require('discord.js')
const { getLastVersion, getAllChampions } = require('../LolApi')

module.exports = {
  config: {
    name: 'update',
    description: 'Atualiza o patch do bot',
    options: [],
  },

  /**
  * @param {ChatInputCommandInteraction<'cached'>} interaction
  */
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE)) return interaction.reply({ content: `Você não tem o cargo <@&${process.env.ADMIN_ROLE}> para fazer isso!`, ephemeral: true })

    const button = new ButtonBuilder().setCustomId('UPDATE PATCH').setLabel('ATUALIZAR PATCH').setStyle(ButtonStyle.Danger).toJSON()

    interaction.reply({ components: [{ type: 1, components: [button] }], content: `O Bot está no patch **${interaction.client.lol.version}** desde <t:${Math.floor(interaction.client.lol.updatedAt / 1000)}>\n\n**Você quer atualizar o patch?**\nÉ bom checar se o LoL realmente atualizou, para que o bot não seja bloqueado de pegar as novas versões futuras (isso acontece caso eu faça muitos pedidos da última versão)\n\nOutra observação é, o bot só precisa ser atualizado caso um novo campeão tenha sido adicinoado, já que é a única informação que o bot usa do LoL` }).catch(() => null)

    const clicked = await interaction.channel.awaitMessageComponent({ time: 15000, filter: (int) => int.user.id === interaction.user.id && int.customId === 'UPDATE PATCH' }).catch(() => null)

    if (!clicked) {
      interaction.deleteReply().catch(() => null)
      return
    }

    const oldPatch = `${interaction.client.lol.version}`
    const newPatch = await getLastVersion();
    const newChampions = await getAllChampions()

    interaction.client.lol = {
      champions: newChampions,
      lower: newChampions.map(a => a.toLowerCase()),
      version: newPatch,
      updatedAt: Date.now(),
    }

    interaction.editReply({ components: [], content: `**Patch Atualizado!**\nPatch Antigo: \`${oldPatch}\`\nNovo Patch: \`${newPatch}\`${`${oldPatch}` === `${newPatch}` ? '\n\n**:warning: OOOO CAAARAAAMBA!!!! NÃO ATUALIZA O PATCH QUANDO O LOL NÃO ATUALIZOU VEI BAAAAH RATIANDO NA MINHA PAE** :warning:' : ''}` }).catch(() => null)
  }
}