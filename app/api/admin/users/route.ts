import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { store } from '@/lib/store';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('panel_session')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    if (!payload.isAdmin) {
      return NextResponse.json({ error: 'Solo tu ID de Discord autorizado' }, { status: 403 });
    }

    return NextResponse.json({
      users: Object.values(store.loggedUsers),
      resources: store.resources,
    });
  } catch {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }
}
