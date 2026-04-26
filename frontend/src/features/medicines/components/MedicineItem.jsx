import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const MedicineItem = ({ medicine, onUpdate, onDelete, isSaving = false, isDeleting = false }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editData, setEditData] = useState({ 
    name: medicine.name, 
    description: medicine.description,
    is_active: medicine.is_active 
  });

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/medicines/${medicine.id}`);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!editData.name.trim()) return;
    try {
      await onUpdate(medicine.id, editData);
      setIsEditing(false);
    } catch (err) {
      // Error handled in the superior page
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (showConfirm) {
      onDelete(medicine.id);
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
        <div className="flex flex-col gap-2 mb-3">
          <input 
            className="w-full p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 text-sm"
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
            placeholder="Nome medicina"
            disabled={isSaving}
            onClick={e => e.stopPropagation()}
          />
          <input 
            className="w-full p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 text-sm"
            value={editData.description}
            onChange={e => setEditData({...editData, description: e.target.value})}
            placeholder="Descrizione"
            disabled={isSaving}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <div className="flex justify-between items-center">
          <label className={`flex items-center gap-2 ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} onClick={e => e.stopPropagation()}>
            <input 
              type="checkbox"
              className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
              checked={editData.is_active}
              onChange={e => setEditData({...editData, is_active: e.target.checked})}
              disabled={isSaving}
            />
            <span className="text-xs font-semibold text-blue-800">Attiva</span>
          </label>
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? '...' : 'Salva'}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} 
              disabled={isSaving}
              className="text-slate-500 text-xs font-medium hover:text-slate-800 disabled:opacity-50 px-2"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`p-4 rounded-2xl border flex justify-between items-center group transition-all duration-200 cursor-pointer overflow-hidden ${
        medicine.is_active 
          ? 'bg-white border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md active:scale-[0.98]' 
          : 'bg-slate-50/50 border-slate-200 opacity-70'
      }`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`font-bold text-base truncate ${medicine.is_active ? 'text-slate-800' : 'text-slate-500'}`}>
            {medicine.name}
          </span>
          {!medicine.is_active && (
            <span className="shrink-0 text-[8px] uppercase font-black px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-full tracking-tighter">OFF</span>
          )}
        </div>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{medicine.description || 'Nessuna descrizione'}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {!showConfirm && (
          <>
            <button 
              onClick={toggleEdit} 
              className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Modifica veloce"
            >
              <FastPencilIcon />
            </button>
            <Link 
              to={`/medicines/${medicine.id}?edit=true`}
              onClick={e => e.stopPropagation()}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Dettagli"
            >
              <PencilIcon />
            </Link>
          </>
        )}

        <button 
          onClick={handleDeleteClick} 
          disabled={isDeleting}
          className={`flex items-center gap-1.5 p-2 rounded-xl transition-all duration-300 ${
            showConfirm 
              ? 'bg-red-600 text-white px-3 ring-4 ring-red-100 scale-105 shadow-lg' 
              : 'text-red-500 hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100'
          } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {showConfirm && <span className="text-[10px] font-bold uppercase tracking-tight">OK?</span>}
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
