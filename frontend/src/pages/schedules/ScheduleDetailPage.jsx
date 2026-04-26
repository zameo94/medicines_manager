import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useMedicationSchedule } from '../../features/medication_schedules/hooks/useMedicationSchedules';
import { ScheduleForm } from '../../features/medication_schedules/components/ScheduleForm';

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { schedule, loading, error, update, remove, isSaving, saveError, isDeleting, deleteError } = useMedicationSchedule(id);
  const isInitiallyEditing = new URLSearchParams(location.search).get('edit') === 'true';

  if (loading) return (
    <div className="max-w-2xl mx-auto p-10 text-center text-slate-400 font-medium animate-pulse">
      Caricamento...
    </div>
  );

  if (error || !schedule) return (
    <div className="max-w-2xl mx-auto p-10 text-center">
      <p className="text-red-500 font-bold mb-4">Errore nel caricamento della programmazione.</p>
      <Link to="/medication-schedules" className="text-blue-600 hover:underline">Torna alla lista</Link>
    </div>
  );

  const handleSave = async (data) => {
    try {
      await update(data);
      navigate(`/medication-schedules/${id}`, { replace: true });
    } catch (err) {
      // Handled by hook
    }
  };

  const handleDelete = async () => {
    try {
      await remove();
      navigate('/medication-schedules', { replace: true });
    } catch (err) {
      // Handled by hook
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <Link to="/medication-schedules" className="text-slate-400 hover:text-slate-600 mb-2 block text-sm font-medium">
          ← Torna alla programmazione
        </Link>
        <h1 className="text-3xl font-black text-slate-900">
          Dettagli Orario
        </h1>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <ScheduleForm 
          schedule={schedule} 
          isEditing={isInitiallyEditing}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => navigate(`/medication-schedules/${id}`, { replace: true })}
          isSaving={isSaving}
          isDeleting={isDeleting}
          error={saveError || deleteError}
        />
      </div>
    </div>
  );
}
