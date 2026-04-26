import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMedicationSchedules } from '../../features/medication_schedules/hooks/useMedicationSchedules';
import { ScheduleItem } from '../../features/medication_schedules/components/ScheduleItem';
import { ScheduleModal } from '../../features/medication_schedules/components/ScheduleModal';

export default function SchedulesPage() {
  const { schedules, loading, error, remove, save, isSaving, saveError, isDeleting, deleteError } = useMedicationSchedules();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-end mb-10">
        <div>
          <Link to="/" className="text-slate-400 hover:text-slate-600 mb-2 block text-sm font-medium">← Dashboard</Link>
          <h1 className="text-4xl font-black text-slate-900">Programmazione</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all"
        >
          + Nuovo Orario
        </button>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {(saveError || deleteError) && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
          ⚠️ {saveError || deleteError}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {schedules.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Nessun orario programmato.</p>
            </div>
          ) : (
            schedules.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)).map(schedule => (
              <ScheduleItem 
                key={schedule.id} 
                schedule={schedule} 
                onUpdate={(id, data) => save(data, id)}
                onDelete={remove}
                isSaving={isSaving}
                isDeleting={isDeleting}
              />
            ))
          )}
        </div>
      )}

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={save}
        isSaving={isSaving}
        error={saveError}
      />
    </div>
  );
}
