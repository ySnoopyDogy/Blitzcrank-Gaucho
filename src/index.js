const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const { readdirSync } = require('fs')
const { join, resolve } = require('path');
const { getAllChampions, getLastVersion } = require('./LolApi');
const RegisterSystem = require("./RegisterSystem");

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once('ready', async () => {
  client.commands = new Collection();

  readdirSync(resolve(__dirname, './commands')).map(file => {
    const cmd = require(join(__dirname, 'commands', file))
    client.commands.set(cmd.config.name, cmd)
  })

  const lolchampions = await getAllChampions()
  const lolversion = await getLastVersion()

  client.lol = {
    champions: lolchampions,
    lower: lolchampions.map(a => a.toLowerCase()),
    version: lolversion,
    updatedAt: Date.now(),
  }

  client.user.setActivity({ name: `Patch ${lolversion}`, type: ActivityType.Competing })

  console.log('[READY] - Tudo Certinho!')

  if (process.env.DEPLOY) client.guilds.cache.get(process.env.GUILD_ID).commands.set(client.commands.map(a => a.config)).then(a => console.log(a.size + ' comandos criados'))
})

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.client.commands.get(interaction.commandName)
    if (!cmd) return
    cmd.execute(interaction)
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'REGISTER') return RegisterSystem(interaction)
  }
});

client.login(process.env.TOKEN)
