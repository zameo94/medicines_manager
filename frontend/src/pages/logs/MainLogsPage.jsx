import { Link } from 'react-router-dom';
import { useMedicationLogs } from '../../features/medication_logs/hooks/useMedicationLogs';
import { LogItem } from '../../features/medication_logs/components/LogItem';

const MainLogsPage = () => {
  const { schedules, referenceDate, loading, error, saveLog } = useMedicationLogs();

  const handleToggle = async (schedule, isTaken) => {
    await saveLog(schedule, isTaken);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
      {error}
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registro Farmaci</h1>
          <p className="text-slate-500 font-medium mt-1 italic">
            Giorno di riferimento: <span className="text-blue-600 not-italic">{formatDate(referenceDate)}</span>
          </p>
        </div>
        <Link 
          to="/medication-logs" 
          className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-slate-200 transition-colors"
          title="Vedi Storico"
        >
          <HistoryIcon />
        </Link>
      </header>

      <div className="grid gap-3">
        {schedules.length > 0 ? (
          schedules.map(schedule => (
            <LogItem 
              key={schedule.id} 
              schedule={schedule} 
              onToggle={handleToggle}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium text-sm">Nessun orario pianificato.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default MainLogsPage;
