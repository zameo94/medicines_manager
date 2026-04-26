import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { medicineService } from '../../../services/api';

export const ScheduleItem = ({ schedule, onUpdate, onDelete, isSaving = false, isDeleting = false }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeMedicines, setActiveMedicines] = useState([]);
  const [editData, setEditData] = useState({ 
    scheduled_time: schedule.scheduled_time.slice(0, 5), 
    medicine_id: schedule.medicine_id
  });

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/medication-schedules/${schedule.id}`);
    }
  };

  useEffect(() => {
    if (isEditing) {
      const fetchMedicines = async () => {
        try {
          const res = await medicineService.getActive();
          setActiveMedicines(res.data);
        } catch (err) {
          console.error("Error fetching active medicines", err);
        }
      };
      fetchMedicines();
    }
  }, [isEditing]);

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      await onUpdate(schedule.id, editData);
      setIsEditing(false);
    } catch (err) {
      // Error handled in superior page
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (showConfirm) {
      onDelete(schedule.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const toggleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-2xl border-2 animate-in fade-in duration-150 ${isSaving ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <input 
            type="text"
            placeholder="HH:MM"
            className="w-24 p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 font-mono font-bold text-center"
            value={editData.scheduled_time}
            onChange={e => setEditData({...editData, scheduled_time: e.target.value})}
            disabled={isSaving}
            onClick={e => e.stopPropagation()}
          />
          <select 
            className="flex-1 min-w-[150px] p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 font-bold text-slate-700"
            value={editData.medicine_id}
            onChange={e => setEditData({...editData, medicine_id: e.target.value})}
            required
            disabled={isSaving}
            onClick={e => e.stopPropagation()}
          >
            {activeMedicines.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSaving ? 'Salvataggio...' : 'Salva'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} 
            disabled={isSaving}
            className="text-slate-500 text-sm font-medium hover:text-slate-800 disabled:opacity-50 px-3"
          >
            Annulla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group transition-all cursor-pointer hover:border-blue-200 hover:shadow-md hover:scale-[1.01]"
    >
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
          <ClockIcon />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-slate-900">
              {schedule.scheduled_time.slice(0, 5)}
            </span>
            <span className="text-slate-300 font-light">|</span>
            <Link 
              to={`/medicines/${schedule.medicine?.id}`} 
              onClick={e => e.stopPropagation()}
              className="font-bold text-lg text-slate-700 hover:text-blue-600 transition-colors"
            >
              {schedule.medicine?.name || 'Medicina non trovata'}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!showConfirm && (
          <>
            <button 
              onClick={toggleEdit} 
              className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Modifica veloce"
            >
              <FastPencilIcon />
            </button>
            <Link 
              to={`/medication-schedules/${schedule.id}`}
              onClick={e => e.stopPropagation()}
              className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Dettagli"
            >
              <PencilIcon />
            </Link>
          </>
        )}
        <button 
          onClick={handleDeleteClick} 
          disabled={isDeleting}
          className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300 ${
            showConfirm 
              ? 'bg-red-600 text-white px-4 ring-4 ring-red-100 scale-105 shadow-lg' 
              : 'text-red-500 hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100'
          } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={showConfirm ? "Conferma eliminazione" : "Elimina"}
        >
          {showConfirm && <span className="text-xs font-bold uppercase tracking-wider">Sei sicuro?</span>}
          {isDeleting ? (
            <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <TrashIcon />
          )}
        </button>
      </div>
    </div>
  );
};

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const FastPencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h2m-2-4h4m-4-4h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
