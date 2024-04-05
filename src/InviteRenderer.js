const svgdom = require('svgdom')
const SVG = require('@svgdotjs/svg.js')
const TextToSVG = require("@naari3/text-to-svg")
const Discord = require('./Discord.js')

SVG.extend([SVG.Path, SVG.Circle], {
  rightmost: function () {
    return this.x() + this.width()
  },
  lowermost: function () {
    return this.y() + this.height()
  }
})

const whitneyBold = TextToSVG.loadSync('./src/fonts/WhitneyBoldRegular.ttf')
const whitneySemibold = TextToSVG.loadSync('./src/fonts/WhitneySemiboldRegular.ttf')
const whitneyMedium = TextToSVG.loadSync('./src/fonts/WhitneyMediumRegular.ttf')

const PADDING = 16
const ICON_SIZE = 50

const HEADER_FONT_SIZE = 12
const HEADER_LINE_HEIGHT = 16
const HEADER_MARGIN_BOTTOM = 12

const SERVER_NAME_SIZE = 16
const SERVER_NAME_LINE_HEIGHT = 20
const SERVER_NAME_MARGIN_BOTTOM = 2

const PRESENCE_FONT_SIZE = 14
const PRESENCE_LINE_HEIGHT = 16
const PRESENCE_TEXT_MARGIN_RIGHT = 8

const PRESENCE_DOT_SIZE = 8
const PRESENCE_DOT_MARGIN_RIGHT = 4

const INVITE_WIDTH = 430
const INVITE_HEIGHT = 110

const BUTTON_WIDTH = 94.75
const BUTTON_HEIGHT = 40
const BUTTON_MARGIN_LEFT = 10

const COMMON_COLORS = {
  joinButtonBackground: '#43b581',
  joinButtonText: '#ffffff',
  online: '#43b581',
  members: '#747f8d'
}

const THEMES = {
  dark: {
    background: '#2f3136',
    serverName: '#ffffff',
    header: '#b9bbbe',
    serverIcon: '#36393f',
    acronymText: '#dcddde',
    presenceText: '#b9bbbe'
  }
}

module.exports = class {
  static async render (inviteCode) {
    const invite = await Discord.getInvite(inviteCode)
    if (!invite.guild) {
      return undefined
    }

    const window = svgdom.createSVGWindow()
    const document = window.document
    SVG.registerWindow(window, document)
    const canvas = SVG.SVG(document.documentElement)
    canvas.viewbox(0, 0, INVITE_WIDTH, INVITE_HEIGHT).width(INVITE_WIDTH).height(INVITE_HEIGHT)

    const themeColors = {
      ...COMMON_COLORS,
      ...(THEMES.dark)
    }

    // Background
    canvas.rect(INVITE_WIDTH, INVITE_HEIGHT).radius(3).fill(themeColors.background)

    // Main Container
    const mainContainer = canvas.nested()
      .width(INVITE_WIDTH - 2 * PADDING)
      .height(INVITE_HEIGHT - 2 * PADDING)
      .move(PADDING, PADDING)

    // Header
    const headerContainer = mainContainer.nested().width(mainContainer.width()).height(HEADER_LINE_HEIGHT)
    headerContainer.path(whitneyBold.getD((invite.guild.features.includes('HUB') ? "You've been invited to join a hub" : "You've been invited to join a server").toUpperCase(), { anchor: 'top left', fontSize: HEADER_FONT_SIZE })).fill(themeColors.header)

    // Content Container
    const contentContainer = mainContainer.nested()
      .width(mainContainer.width())
      .height(mainContainer.height() - headerContainer.height() - HEADER_MARGIN_BOTTOM)
      .move(0, headerContainer.height() + HEADER_MARGIN_BOTTOM)

    // Server Icon
    const squircle = contentContainer.rect(ICON_SIZE, ICON_SIZE).radius(16).fill(themeColors.serverIcon)
    if (invite.guild.icon) {
      const iconBase64 = await Discord.fetchIcon(Discord.getIconUrl(invite.guild.id, invite.guild.icon))
      const iconImage = contentContainer.image(`data:image/${invite.guild.icon.startsWith('a_') ? 'gif' : 'jpg'};base64,${iconBase64}`).size(ICON_SIZE, ICON_SIZE)
      iconImage.clipWith(squircle)
    }

    // Join button
    const buttonContainer = contentContainer.nested()
      .width(BUTTON_WIDTH)
      .height(BUTTON_HEIGHT)
      .move(contentContainer.width() - BUTTON_WIDTH, (contentContainer.height() - BUTTON_HEIGHT) / 2)
      .linkTo(link => {
        link.to(`https://discord.gg/${inviteCode}`).target('_blank')
      })
    buttonContainer.rect(BUTTON_WIDTH, BUTTON_HEIGHT)
      .radius(3)
      .fill(themeColors.joinButtonBackground)
    const joinButtonText = buttonContainer.path(whitneyMedium.getD("Join", { fontSize: 14 }))
      .fill(themeColors.joinButtonText)
    joinButtonText.move((BUTTON_WIDTH - joinButtonText.width()) / 2, (BUTTON_HEIGHT - joinButtonText.height()) / 2)

    let EXTRA_SERVER_NAME_PADDING = 0

    const innerContainer = contentContainer.nested()
      .width(contentContainer.width() - ICON_SIZE - PADDING - BUTTON_WIDTH - BUTTON_MARGIN_LEFT)
      .height(SERVER_NAME_LINE_HEIGHT + SERVER_NAME_MARGIN_BOTTOM + PRESENCE_LINE_HEIGHT)
      .x(ICON_SIZE + PADDING, 0)
    innerContainer.y((contentContainer.height() - innerContainer.height()) / 2)

    // Server Name
    const serverNameText = innerContainer.path(whitneySemibold.getD(invite.guild.name, { anchor: 'top left', fontSize: SERVER_NAME_SIZE }))
      .fill(themeColors.serverName)
      .x(EXTRA_SERVER_NAME_PADDING)
    serverNameText.y((SERVER_NAME_LINE_HEIGHT - serverNameText.height) / 2)

    const presenceContainer = innerContainer.nested()
      .height(PRESENCE_LINE_HEIGHT)
      .width(innerContainer.width())
      .y(SERVER_NAME_LINE_HEIGHT + SERVER_NAME_MARGIN_BOTTOM)

    // Online and member counts
    presenceContainer.circle(PRESENCE_DOT_SIZE)
      .fill(themeColors.online)
      .y((PRESENCE_LINE_HEIGHT - PRESENCE_DOT_SIZE) / 2)
    const presenceText = presenceContainer.path(whitneySemibold.getD(`${invite.approximate_presence_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Online`, { fontSize: PRESENCE_FONT_SIZE }))
      .fill(themeColors.presenceText)
      .x(PRESENCE_DOT_SIZE + PRESENCE_DOT_MARGIN_RIGHT)
    presenceText.y((PRESENCE_LINE_HEIGHT - presenceText.height()) / 2)
    presenceContainer.circle(PRESENCE_DOT_SIZE)
      .fill(themeColors.members)
      .y((PRESENCE_LINE_HEIGHT - PRESENCE_DOT_SIZE) / 2)
      .x(PRESENCE_DOT_SIZE + PRESENCE_DOT_MARGIN_RIGHT + presenceText.width() + PRESENCE_TEXT_MARGIN_RIGHT)
    const membersText = presenceContainer.path(whitneySemibold.getD(`${invite.approximate_member_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Members`, { fontSize: PRESENCE_FONT_SIZE }))
      .fill(themeColors.presenceText)
      .x(PRESENCE_DOT_SIZE + PRESENCE_DOT_MARGIN_RIGHT + presenceText.width() + PRESENCE_TEXT_MARGIN_RIGHT + PRESENCE_DOT_SIZE + PRESENCE_DOT_MARGIN_RIGHT)
    membersText.y((PRESENCE_LINE_HEIGHT - membersText.height()) / 2)

    return canvas.svg()
  }
}
