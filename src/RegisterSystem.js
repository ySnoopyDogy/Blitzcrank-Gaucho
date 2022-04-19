const { ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders')
const { ButtonInteraction, TextInputStyle, ButtonStyle } = require('discord.js')
const { findBestMatch } = require('string-similarity')



/**
 * @param {ButtonInteraction} interaction
 */
const assignRole = async (interaction, champ) => {
  const { guild, member } = interaction;

  const toAssignRole = guild.roles.cache.find(a => a.name.endsWith(champ)) ?? await guild.roles.create({ name: `Mono ${champ}`, reason: `[AUTOROLE] - Cargo criado para monos ${champ}` }).catch(() => null)

  if (!toAssignRole) {
    interaction.followUp({ content: 'Ocorreu um erro criando um novo cargo! Avise um ADM', ephemeral: true })
    return;
  }

  const oldUserRole = member.roles.cache.find(a => a.name.startsWith('Mono '))

  if (oldUserRole && toAssignRole.id !== oldUserRole.id)
    member.roles.remove(oldUserRole.id, { reason: '[AUTOROLE] - Usuário está se registrando com outro mono' })

  if (oldUserRole && toAssignRole.id === oldUserRole.id)
    return

  member.roles.add(toAssignRole.id).catch(() => null)
}

/**
 * @param {ButtonInteraction} interaction
 */
module.exports = async (interaction) => {
  const id = Date.now()
  const modal = new ModalBuilder().setCustomId(`${id} CHAMPION`).setTitle(`Qual é o seu mono, ${interaction.user.username}?`)
    .addComponents(new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId('champion').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('Blitzcrank').setLabel('Nome de Seu MonoChamp')))
    .addComponents(new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId('nickname').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('blitzcrankkk gaúcho').setLabel('Nick da sua conta')))

  interaction.showModal(modal)

  const collected = await interaction.awaitModalSubmit({ time: 30_000, filter: (int) => int.customId.startsWith(id) }).catch(() => null)

  if (!collected) return;

  let champion = collected.fields.getTextInputValue('champion');
  const nick = collected.fields.getTextInputValue('nickname');

  if (!interaction.client.lol.lower.includes(champion.toLowerCase())) {
    const close = findBestMatch(champion, interaction.client.lol.champions)

    const yes = new ButtonBuilder().setCustomId('YES').setLabel('Sim').setStyle(ButtonStyle.Success).toJSON()
    const no = new ButtonBuilder().setCustomId('NO').setLabel('Não').setStyle(ButtonStyle.Danger).toJSON()

    collected.reply({ content: `Nenhum resultado encontrado para \`${champion}\`\nVocê quis dizer \`${close.bestMatch.target}\` ?`, components: [{ type: 1, components: [no, yes] }] })

    const yesOrNo = await collected.channel.awaitMessageComponent({ time: 7_000, filter: (int) => int.user.id === collected.user.id && int.customId.length <= 3 }).catch(() => null)

    collected.deleteReply().catch(() => null)

    if (!yesOrNo || yesOrNo.customId === 'NO') return

    champion = close.bestMatch.target
  }

  champion = findBestMatch(champion, interaction.client.lol.champions).bestMatch.target

  interaction.member.setNickname(nick, '[AUTONICK] - Nickname trocado para ser encontrado no jogo').catch(() => null)

  collected.replied ?
    collected.followUp({ content: `Bem-Vindo ${nick}, o tal do Mono ${champion}`, ephemeral: true }).catch(() => null)
    : collected.reply({ content: `Bem-Vindo ${nick}, o tal do Mono ${champion}`, ephemeral: true }).catch(() => null)

  assignRole(interaction, champion)
}