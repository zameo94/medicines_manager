import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const LogsPage = () => {
  const [groupedEntries, setGroupedEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/medication-logs/index', {
        params: { start_date: startDate, end_date: endDate }
      });
      
      const grouped = response.data.reduce((acc, entry) => {
        const date = entry.reference_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
      }, {});

      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => 
          a.schedule.scheduled_time.localeCompare(b.schedule.scheduled_time)
        );
      });

      setGroupedEntries(grouped);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dello storico');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Storico Assunzioni</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Gestisci l'intervallo temporale</p>
        </div>
        <Link 
          to="/medication-logs/main" 
          className="text-blue-600 font-bold text-sm hover:underline"
        >
          Vai a Registro
        </Link>
      </header>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Inizio</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={() => setEndDate(startDate)}
              className="bg-slate-100 text-slate-500 p-2 rounded-xl hover:bg-slate-200 transition-colors"
              title="Copia in fine"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Fine</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm">{error}</div>
      ) : (
        <div className="space-y-10">
          {sortedDates.length > 0 ? (
            sortedDates.map(date => (
              <div key={date} className="relative">
                <div className="sticky top-0 z-10 bg-slate-50 py-2 mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                    {formatDate(date)} {groupedEntries[date][0]?.is_today && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md ml-1">Oggi</span>}
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </h2>
                </div>

                <div className="grid gap-3">
                  {groupedEntries[date].map((entry, idx) => (
                    <div key={`${date}-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center transition-all hover:border-slate-200">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 truncate">{entry.schedule.medicine.name}</span>
                          <span className="shrink-0 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                            {entry.schedule.scheduled_time.substring(0, 5)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium tracking-tight">
                          {entry.log ? `Registrato alle ${new Date(entry.log.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : 'Non ancora registrato'}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {entry.log?.is_taken ? (
                          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl border border-green-100">
                            <span className="text-[10px] font-black uppercase tracking-wider">Presa</span>
                          </div>
                        ) : (
                          entry.is_today && entry.schedule.is_late ? (
                            <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                              <span className="text-[10px] font-black uppercase tracking-wider">In ritardo</span>
                            </div>
                          ) : entry.is_today || entry.is_future ? (
                            <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-black uppercase tracking-wider">Da assumere</span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-xl border border-red-100">
                              <span className="text-[10px] font-black uppercase tracking-wider">Saltata</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-sm">Nessun log per questo intervallo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

export default LogsPage;
