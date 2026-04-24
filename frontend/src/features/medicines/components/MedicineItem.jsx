import { useState } from 'react';

export const MedicineItem = ({ medicine, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editData, setEditData] = useState({ 
    name: medicine.name, 
    description: medicine.description,
    is_active: medicine.is_active 
  });

  const handleSave = () => {
    if (!editData.name.trim()) return;
    onUpdate(medicine.id, editData);
    setIsEditing(false);
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
      <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200 animate-in fade-in duration-150">
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <input 
            className="flex-1 min-w-[150px] p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
            placeholder="Nome medicina"
          />
          <input 
            className="flex-1 min-w-[200px] p-2.5 rounded-xl border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={editData.description}
            onChange={e => setEditData({...editData, description: e.target.value})}
            placeholder="Descrizione"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox"
              className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
              checked={editData.is_active}
              onChange={e => setEditData({...editData, is_active: e.target.checked})}
            />
            <span className="text-sm font-semibold text-blue-800">Attiva</span>
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
              Salva
            </button>
            <button onClick={() => setIsEditing(false)} className="text-slate-500 text-sm font-medium hover:text-slate-800">
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
          <h3 className={`font-bold text-lg ${medicine.is_active ? 'text-slate-800' : 'text-slate-500'}`}>
            {medicine.name}
          </h3>
          {!medicine.is_active && (
            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full tracking-tighter">Inattiva</span>
          )}
        </div>
        <p className="text-slate-500 text-sm mt-1">{medicine.description || 'Nessuna descrizione'}</p>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        {!showConfirm && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            title="Modifica"
          >
            <PencilIcon />
          </button>
        )}

        <button 
          onClick={handleDeleteClick} 
          className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300 ${
            showConfirm 
              ? 'bg-red-600 text-white px-4 ring-4 ring-red-100 scale-105 shadow-lg' 
              : 'text-red-500 hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100'
          }`}
          title={showConfirm ? "Conferma eliminazione" : "Elimina"}
        >
          {showConfirm && <span className="text-xs font-bold uppercase tracking-wider">Sei sicuro?</span>}
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

// --- ICONE SVG (Outline Style) ---

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