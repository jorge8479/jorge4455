import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { store } from '@/lib/store';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('panel_session')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const id = String(payload.id);
    const record = store.loggedUsers[id];
    const resource =
      store.resources.find((r) => Number(r.id) === Number(record?.resourceId)) || null;

    return NextResponse.json({
      user: payload,
      key: record?.key || '',
      resource,
    });
  } catch {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }
}
