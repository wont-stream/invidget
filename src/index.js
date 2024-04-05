const InviteRenderer = require('./InviteRenderer.js')
const InviteResolver = require('./InviteResolver')

const server = Bun.serve({
  async fetch(req) {
    const query = new URL(req.url).pathname.replace("/","");

    const inviteCode = await InviteResolver.resolve(query)
    const inviteSVG = await InviteRenderer.render(inviteCode, req.query)

    if (typeof inviteSVG === 'undefined') {
      return new Response(404, {
        status: 404
      })
    }

    return new Response(inviteSVG, {
      headers: {
        "content-type": "image/svg+xml"
      }
    });
  }
});