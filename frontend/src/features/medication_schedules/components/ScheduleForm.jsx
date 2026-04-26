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
  const [formData, setFormData] = useState({
    scheduled_time: '08:00',
    medicine_id: ''
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
        medicine_id: schedule.medicine_id
      });
    }
  }, [schedule]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  if (!isEditing && schedule) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="grid gap-6">
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
        </div>

        <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400">ID: {schedule.id}</p>
            {onDelete && (
              <button 
                onClick={handleDelete}
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
      
      <div className="space-y-4">
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
          <p className="text-[10px] text-slate-400 mt-2 ml-1 uppercase font-bold tracking-tight italic">Formato HH:MM o HH:MM:SS</p>
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
            onClick={handleDelete}
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
