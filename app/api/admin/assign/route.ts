import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('panel_session')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    if (!payload.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();

    if (body.action === 'assignUser') {
      const user = store.loggedUsers[body.userId];
      if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      user.key = String(body.key || '').trim();
      user.resourceId = body.resourceId ? Number(body.resourceId) : null;
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'saveResource') {
      const idx = store.resources.findIndex((r) => r.id === Number(body.resourceId));
      if (idx === -1) return NextResponse.json({ error: 'Slot inválido' }, { status: 404 });
      store.resources[idx] = {
        id: Number(body.resourceId),
        name: String(body.resourceName || `Resource #${body.resourceId}`).trim(),
        url: String(body.resourceUrl || '').trim(),
      };
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Error de sesión' }, { status: 401 });
  }
}
