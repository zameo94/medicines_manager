import { useState } from 'react';
import { Link } from 'react-router-dom';

export const MedicineItem = ({ medicine, onUpdate, onDelete, isSaving = false, isDeleting = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editData, setEditData] = useState({ 
    name: medicine.name, 
    description: medicine.description,
    is_active: medicine.is_active 
  });

  const handleSave = async () => {
    if (!editData.name.trim()) return;
    try {
      await onUpdate(medicine.id, editData);
      setIsEditing(false);
    } catch (err) {
      // Error handled in the supirior page
    }
  };

  const handleDeleteClick = () => {
    if (showConfirm) {
      onDelete(medicine.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-2xl border-2 animate-in fade-in duration-150 ${isSaving ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <input 
            className="flex-1 min-w-[150px] p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
            placeholder="Nome medicina"
            disabled={isSaving}
          />
          <input 
            className="flex-1 min-w-[200px] p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
            value={editData.description}
            onChange={e => setEditData({...editData, description: e.target.value})}
            placeholder="Descrizione"
            disabled={isSaving}
          />
        </div>
        <div className="flex justify-between items-center">
          <label className={`flex items-center gap-2 ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input 
              type="checkbox"
              className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
              checked={editData.is_active}
              onChange={e => setEditData({...editData, is_active: e.target.checked})}
              disabled={isSaving}
            />
            <span className="text-sm font-semibold text-blue-800">Attiva</span>
          </label>
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Salvataggio...' : 'Salva'}
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              disabled={isSaving}
              className="text-slate-500 text-sm font-medium hover:text-slate-800 disabled:opacity-50"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-5 rounded-2xl border flex justify-between items-center group transition-all duration-200 ${
      medicine.is_active ? 'border-slate-100 shadow-sm' : 'border-slate-200 bg-slate-50/50 opacity-70'
    }`}>
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <Link 
            to={`/medicines/${medicine.id}`}
            className={`font-bold text-lg hover:text-blue-600 transition-colors ${medicine.is_active ? 'text-slate-800' : 'text-slate-500'}`}
          >
            {medicine.name}
          </Link>
          {!medicine.is_active && (
            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full tracking-tighter">Inattiva</span>
          )}
        </div>
        <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap line-clamp-2">{medicine.description || 'Nessuna descrizione'}</p>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {!showConfirm && (
          <>
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Modifica veloce"
            >
              <FastPencilIcon />
            </button>
            <Link 
              to={`/medicines/${medicine.id}?edit=true`}
              className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Dettagli e Modifica"
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

// --- ICONE SVG (Outline Style) ---

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