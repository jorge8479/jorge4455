'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MeResponse {
  user: {
    id: string;
    username: string;
    avatar: string;
    isAdmin: boolean;
  };
  key: string;
  resource: {
    id: number;
    name: string;
    url: string;
  } | null;
}

export default function ClientePage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/');
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      });
  }, [router]);

  const copyKey = () => {
    if (!data?.key) return;
    navigator.clipboard.writeText(data.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Cargando tu panel...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img src={data.user.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-xl font-bold">{data.user.username}</h1>
              <p className="text-xs text-slate-400">ID: {data.user.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {data.user.isAdmin && (
              <a
                href="/admin"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Panel Admin
              </a>
            )}
            <a
              href="/api/auth/logout"
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Cerrar sesión
            </a>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">Tu Key asignada:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-900 px-3 py-2.5 rounded-lg text-sm text-emerald-400 break-all">
              {data.key || 'Aún no tienes una key asignada.'}
            </code>
            <button
              onClick={copyKey}
              disabled={!data.key}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition"
            >
              {copied ? '¡Copiada!' : 'Copiar Key'}
            </button>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">Tu Resource asignado:</p>
          {data.resource && data.resource.url ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-white">
                  {data.resource.name}{' '}
                  <span className="text-xs text-slate-400">(Slot #{data.resource.id})</span>
                </p>
              </div>
              <a
                href={data.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Descargar Resource
              </a>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aún no tienes un resource asignado.</p>
          )}
        </div>
      </div>
    </main>
  );
}
