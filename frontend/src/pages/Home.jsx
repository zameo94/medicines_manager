import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <h1 className="text-4xl font-black text-slate-800 mb-8 text-center">
        Gestione Salute
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-4xl px-4">
        <Link to="/medication-logs/main" className="p-8 bg-purple-600 text-white rounded-3xl shadow-xl hover:scale-105 transition-transform text-center">
          <span className="text-4xl block mb-2">📅💊</span>
          <span className="font-bold text-xl">Registro</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        <Link to="/medicines" className="p-8 bg-blue-600 text-white rounded-3xl shadow-xl hover:scale-105 transition-transform text-center">
          <span className="text-4xl block mb-2">💊</span>
          <span className="font-bold text-xl">Medicine</span>
        </Link>
        <Link to="/medication-schedules" className="p-8 bg-emerald-600 text-white rounded-3xl shadow-xl hover:scale-105 transition-transform text-center">
          <span className="text-4xl block mb-2">⏰💊</span>
          <span className="font-bold text-xl">Orari</span>
        </Link>
      </div>
    </div>
  );
}