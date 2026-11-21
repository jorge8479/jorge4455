export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Área de Clientes</h1>
        <p className="text-slate-400 text-sm mb-6">
          Inicia sesión con tu cuenta de Discord para copiar tu key y descargar el resource asignado.
        </p>
        <a
          href="/api/auth/login"
          className="inline-block w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 px-5 rounded-xl transition"
        >
          Iniciar sesión con Discord
        </a>
      </div>
    </main>
  );
}
