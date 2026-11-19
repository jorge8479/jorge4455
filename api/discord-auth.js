export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { code, accessToken, redirectUri, guildId } = req.body || {};
    const clientId = process.env.DISCORD_CLIENT_ID || '1569510377639780452';
    const clientSecret =
      process.env.DISCORD_CLIENT_SECRET || 'w20l_pCcpdd-1AlXCrAy7uCtIsktEVot';
    const finalRedirectUri =
      redirectUri || process.env.DISCORD_REDIRECT_URI || 'https://jorge4455.vercel.app';

    let token = accessToken;

    if (!token) {
      if (!code) {
        return res.status(400).json({ error: 'Falta el código de autorización de Discord.' });
      }
      if (!clientSecret) {
        return res.status(500).json({
          error: 'Falta configurar DISCORD_CLIENT_SECRET en Vercel.'
        });
      }

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: finalRedirectUri
      });

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        const oauthErr =
          typeof tokenData.error_description === 'string'
            ? tokenData.error_description
            : typeof tokenData.error === 'string'
            ? tokenData.error
            : 'No se pudo intercambiar el código con Discord.';
        return res.status(401).json({ error: oauthErr });
      }

      token = tokenData.access_token;
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await userRes.json();

    if (!userRes.ok || !user.id) {
      return res.status(401).json({
        error: 'No se pudo obtener el perfil del usuario en Discord.'
      });
    }

    let inGuild = false;
    if (guildId) {
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (guildsRes.ok) {
        const guilds = await guildsRes.json();
        inGuild =
          Array.isArray(guilds) &&
          guilds.some((guild) => String(guild.id) === String(guildId));
      }
    }

    return res.status(200).json({
      accessToken: token,
      user,
      inGuild
    });
  } catch (err) {
    const message =
      err && typeof err.message === 'string' && err.message
        ? err.message
        : 'Error interno en el servidor de autenticación.';
    return res.status(500).json({ error: message });
  }
}
