'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResourceItem {
  id: number;
  name: string;
  url: string;
}

interface LoggedUser {
  id: string;
  username: string;
  avatar: string;
  lastLogin: string;
  key: string;
  resourceId: number | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<LoggedUser[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [showResources, setShowResources] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const res = await fetch('/api/admin/users');
    if (res.status === 401 || res.status === 403) {
      router.push('/cliente');
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
    setResources(data.resources || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUser = async (user: LoggedUser) => {
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assignUser',
        userId: user.id,
        key: user.key,
        resourceId: user.resourceId,
      }),
    });
    if (res.ok) {
      alert(`Guardado para ${user.username}`);
      loadData();
    }
  };

  const handleSaveResource = async (item: ResourceItem) => {
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'saveResource',
        resourceId: item.id,
        resourceName: item.name,
        resourceUrl: item.url,
      }),
    });
    if (res.ok) {
      alert(`Resource #${item.id} guardado`);
      loadData();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Verificando permisos de administrador...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Panel de Administrador</h1>
            <p className="text-xs text-slate-400">Acceso exclusivo autorizado por ID de Discord</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResources(!showResources)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm"
            >
              {showResources ? 'Ocultar resources' : 'Ver resources (10)'}
            </button>
            <a
              href="/cliente"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
            >
              Vista Cliente
            </a>
            <a
              href="/api/auth/logout"
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
            >
              Cerrar sesión
            </a>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/70 text-slate-300">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">ID Discord</th>
                <th className="p-3">Último Login</th>
                <th className="p-3">Key</th>
                <th className="p-3">Resource (1-10)</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-slate-400">
                    Nadie ha iniciado sesión todavía.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id}>
                    <td className="p-3 font-semibold">{u.username}</td>
                    <td className="p-3 font-mono text-xs text-slate-400">{u.id}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(u.lastLogin).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={u.key}
                        placeholder="Ej: NOVA-XXXX"
                        onChange={(e) => {
                          const copy = [...users];
                          copy[idx] = { ...u, key: e.target.value };
                          setUsers(copy);
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs w-40"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={u.resourceId ?? ''}
                        onChange={(e) => {
                          const copy = [...users];
                          copy[idx] = {
                            ...u,
                            resourceId: e.target.value ? Number(e.target.value) : null,
                          };
                          setUsers(copy);
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                      >
                        <option value="">-- Sin resource --</option>
                        {resources.map((r) => (
                          <option key={r.id} value={r.id}>
                            #{r.id} - {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleSaveUser(u)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showResources && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Lista de 10 Resources</h2>
              <p className="text-xs text-slate-400">
                Configura el nombre y URL de descarga para cada slot del 1 al 10.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r, idx) => (
                <div
                  key={r.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <p className="text-sm font-bold text-emerald-400">Resource #{r.id}</p>
                  <input
                    type="text"
                    value={r.name}
                    placeholder="Nombre del resource"
                    onChange={(e) => {
                      const copy = [...resources];
                      copy[idx] = { ...r, name: e.target.value };
                      setResources(copy);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={r.url}
                    placeholder="URL de descarga directa (.zip)"
                    onChange={(e) => {
                      const copy = [...resources];
                      copy[idx] = { ...r, url: e.target.value };
                      setResources(copy);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSaveResource(r)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Guardar #{r.id}
                    </button>
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs"
                      >
                        Probar link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
