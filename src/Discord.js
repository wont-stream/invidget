const API_BASE_URL = 'https://discord.com/api/v10'
const CDN_BASE_URL = 'https://cdn.discordapp.com'

module.exports = class {
  static getWidget (guildId) {
    return fetch(`${API_BASE_URL}/guilds/${guildId}/widget.json`).then(res => res.json())
  }

  static getInvite (inviteCode) {
    return fetch(`${API_BASE_URL}/invites/${inviteCode}?with_counts=true`).then(res => res.json())
  }

  static fetchIcon (iconUrl) {
    return fetch(iconUrl).then(res => res.arrayBuffer()).then(buffer => Buffer.from(buffer).toString("base64"))
  }

  static getIconUrl (guildId, iconId) {
    return `${CDN_BASE_URL}/icons/${guildId}/${iconId}${iconId.startsWith('a_') ? '.gif' : '.webp'}`
  }
}
