import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicineService } from '../../../services/api';

export const ScheduleForm = ({ 
  schedule, 
  isEditing: initialIsEditing = false, 
  onSave, 
  onCancel,
  onDelete,
  isSaving = false,
  isDeleting = false,
  error = null
}) => {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeMedicines, setActiveMedicines] = useState([]);

  useEffect(() => {
    setIsEditing(initialIsEditing);
  }, [initialIsEditing]);

  const [formData, setFormData] = useState({
    scheduled_time: '08:00',
    medicine_id: '',
    frequency: 'DAILY',
    interval: 1,
    days_of_week: [],
    day_of_month: 1,
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await medicineService.getActive();
        setActiveMedicines(res.data);
        if (res.data.length > 0 && !schedule) {
          setFormData(prev => ({ ...prev, medicine_id: res.data[0].id }));
        }
      } catch (err) {
        console.error("Error fetching active medicines", err);
      }
    };
    fetchMedicines();
  }, [schedule]);

  useEffect(() => {
    if (schedule) {
      setFormData({
        scheduled_time: schedule.scheduled_time.slice(0, 5),
        medicine_id: schedule.medicine_id,
        frequency: schedule.frequency || 'DAILY',
        interval: schedule.interval || 1,
        days_of_week: schedule.days_of_week || [],
        day_of_month: schedule.day_of_month || 1,
        start_date: schedule.start_date || new Date().toISOString().split('T')[0]
      });
    }
  }, [schedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      interval: parseInt(formData.interval),
      day_of_month: formData.frequency === 'MONTHLY' ? parseInt(formData.day_of_month) : null,
      days_of_week: formData.frequency === 'WEEKLY' ? formData.days_of_week : null
    };
    try {
      await onSave(submissionData);
      setIsEditing(false);
    } catch (err) {
      // Error is handled by the parent/hook
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const current = prev.days_of_week || [];
      if (current.includes(day)) {
        return { ...prev, days_of_week: current.filter(d => d !== day) };
      } else {
        return { ...prev, days_of_week: [...current, day].sort() };
      }
    });
  };

  const onDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const days = [
    { label: 'Lun', value: 0 },
    { label: 'Mar', value: 1 },
    { label: 'Mer', value: 2 },
    { label: 'Gio', value: 3 },
    { label: 'Ven', value: 4 },
    { label: 'Sab', value: 5 },
    { label: 'Dom', value: 6 }
  ];

  if (!isEditing && schedule) {
    const getRecurrenceText = () => {
      if (formData.frequency === 'DAILY') {
        return formData.interval === 1 ? 'Ogni giorno' : `Ogni ${formData.interval} giorni`;
      }
      if (formData.frequency === 'WEEKLY') {
        const selectedDays = days.filter(d => formData.days_of_week?.includes(d.value)).map(d => d.label);
        const intervalText = formData.interval === 1 ? 'ogni settimana' : `ogni ${formData.interval} settimane`;
        return `${selectedDays.join(', ')} ${intervalText}`;
      }
      if (formData.frequency === 'MONTHLY') {
        const intervalText = formData.interval === 1 ? 'ogni mese' : `ogni ${formData.interval} mesi`;
        return `Il giorno ${formData.day_of_month} ${intervalText}`;
      }
      return '';
    };

    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="grid gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl w-fit">
              <span className="text-3xl font-black">{formData.scheduled_time}</span>
            </div>
            <div>
              <h4 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1">Medicina</h4>
              <p className="font-bold text-xl text-slate-800">
                {schedule.medicine?.name ? (
                  <Link 
                    to={`/medicines/${schedule.medicine.id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {schedule.medicine.name}
                  </Link>
                ) : (
                  'Caricamento...'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div>
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Ricorrenza</h4>
              <p className="font-bold text-slate-700">{getRecurrenceText() || 'Giornaliera'}</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Data Inizio</h4>
              <p className="font-bold text-slate-700">
                {formData.start_date ? new Date(formData.start_date).toLocaleDateString('it-IT') : 'Oggi'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400">ID: {schedule.id}</p>
            {onDelete && (
              <button 
                onClick={onDeleteClick}
                disabled={isDeleting}
                className={`mt-2 text-left text-xs font-bold uppercase tracking-tighter transition-colors ${showDeleteConfirm ? 'text-red-600' : 'text-red-400 hover:text-red-600'}`}
              >
                {isDeleting ? 'Eliminazione...' : showDeleteConfirm ? 'Clicca per confermare' : 'Elimina Orario'}
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            Modifica Orario
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Medicina</label>
            <select 
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all font-bold text-slate-700"
              value={formData.medicine_id}
              onChange={e => setFormData({...formData, medicine_id: e.target.value})}
              required
              disabled={isSaving}
            >
              <option value="" disabled>Seleziona una medicina</option>
              {activeMedicines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Orario</label>
            <input 
              type="text"
              placeholder="HH:MM (es. 17:23)"
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all font-mono font-bold text-slate-700"
              value={formData.scheduled_time}
              onChange={e => setFormData({...formData, scheduled_time: e.target.value})}
              required
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl space-y-6 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-1">Frequenza</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-bold text-slate-700"
                value={formData.frequency}
                onChange={e => setFormData({...formData, frequency: e.target.value})}
                required
              >
                <option value="DAILY">Giornaliera</option>
                <option value="WEEKLY">Settimanale</option>
                <option value="MONTHLY">Mensile</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-1">Intervallo</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min="1"
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-bold text-slate-700"
                  value={formData.interval}
                  onChange={e => setFormData({...formData, interval: e.target.value})}
                  required
                />
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                  {formData.frequency === 'DAILY' ? 'giorni' : formData.frequency === 'WEEKLY' ? 'settimane' : 'mesi'}
                </span>
              </div>
            </div>
          </div>

          {formData.frequency === 'WEEKLY' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 ml-1">Giorni della settimana</label>
              <div className="flex flex-wrap gap-2">
                {days.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      formData.days_of_week?.includes(day.value)
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.frequency === 'MONTHLY' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-1">Giorno del mese</label>
              <input 
                type="number"
                min="1"
                max="31"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-bold text-slate-700"
                value={formData.day_of_month}
                onChange={e => setFormData({...formData, day_of_month: e.target.value})}
                required
              />
              <p className="text-[10px] text-slate-400 mt-2 ml-1 italic font-medium">Nota: Se inserisci 31, verrà usato l'ultimo giorno di ogni mese.</p>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-1">Data Inizio</label>
            <input 
              type="date"
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-bold text-slate-700"
              value={formData.start_date}
              onChange={e => setFormData({...formData, start_date: e.target.value})}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3">
          <button 
            type="submit" 
            disabled={isSaving || isDeleting || activeMedicines.length === 0}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {isSaving ? 'Salvataggio...' : 'Salva Programmazione'}
          </button>
          <button 
            type="button"
            disabled={isSaving || isDeleting}
            onClick={() => {
              if (schedule) setIsEditing(false);
              if (onCancel) onCancel();
            }}
            className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Annulla
          </button>
        </div>
        
        {onDelete && schedule && !isEditing && (
          <button 
            type="button"
            onClick={onDeleteClick}
            disabled={isSaving || isDeleting}
            className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 transition-all"
          >
            Elimina Orario
          </button>
        )}
      </div>
    </form>
  );
};
