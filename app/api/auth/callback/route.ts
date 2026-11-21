import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { store } from '@/lib/store';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Falta code' }, { status: 400 });

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.json({ error: 'Error OAuth Discord' }, { status: 401 });
  }

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const discordUser = await userRes.json();

  const existing = store.loggedUsers[discordUser.id];
  const avatar = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  store.loggedUsers[discordUser.id] = {
    id: discordUser.id,
    username: discordUser.global_name || discordUser.username,
    avatar,
    lastLogin: new Date().toISOString(),
    key: existing?.key || '',
    resourceId: existing?.resourceId ?? null,
  };

  const isAdmin = discordUser.id === process.env.ADMIN_DISCORD_ID;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({
    id: discordUser.id,
    username: store.loggedUsers[discordUser.id].username,
    avatar,
    isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  const response = NextResponse.redirect(new URL(isAdmin ? '/admin' : '/cliente', req.url));
  response.cookies.set('panel_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
