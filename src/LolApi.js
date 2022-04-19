const fetch = require('node-fetch')

const CHAMPIONS = (version) => `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`
const VERSIONS = () => 'https://ddragon.leagueoflegends.com/api/versions.json'

const getLastVersion = async () => {
  const result = await fetch(VERSIONS())
  const json = await result.json()
  return json[0]
}

const getAllChampions = async () => {
  const result = await fetch(CHAMPIONS(await getLastVersion()))
  const json = await result.json()
  const champs = Object.values(json.data)
  return champs.map(a => a.name)
}

module.exports = { CHAMPIONS, VERSIONS, getLastVersion, getAllChampions }