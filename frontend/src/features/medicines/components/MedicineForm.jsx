import { useState, useEffect } from 'react';

export const MedicineForm = ({ 
  medicine, 
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        description: medicine.description || '',
        is_active: medicine.is_active
      });
    }
  }, [medicine]);

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

  if (!isEditing) {
    return (
      <div className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
            ⚠️ {error}
          </div>
        )}
        <div className="grid gap-6">
          <div>
            <h4 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1 ml-1">Informazioni</h4>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {medicine.description || 'Nessuna descrizione fornita.'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1 ml-1">Stato</h4>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${medicine.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className={`font-bold ${medicine.is_active ? 'text-green-600' : 'text-slate-500'}`}>
                {medicine.is_active ? 'Attiva' : 'Inattiva'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400">
              Ultimo aggiornamento: {new Date(medicine.updated_at || medicine.created_at).toLocaleString('it-IT')}
            </p>
            {onDelete && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className={`mt-2 text-left text-xs font-bold uppercase tracking-tighter transition-colors ${showDeleteConfirm ? 'text-red-600' : 'text-red-400 hover:text-red-600'}`}
              >
                {isDeleting ? 'Eliminazione...' : showDeleteConfirm ? 'Clicca per confermare' : 'Elimina Medicina'}
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            Modifica Dettagli
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
          ⚠️ {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nome</label>
          <input 
            className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all disabled:opacity-50"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Descrizione</label>
          <textarea 
            className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all min-h-[120px] disabled:opacity-50"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            disabled={isSaving}
          />
        </div>
        <label className={`flex items-center gap-3 p-4 bg-slate-50 rounded-2xl transition-colors ${isSaving ? 'opacity-50' : 'cursor-pointer hover:bg-slate-100'}`}>
          <input 
            type="checkbox"
            className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={formData.is_active}
            onChange={e => setFormData({...formData, is_active: e.target.checked})}
            disabled={isSaving}
          />
          <span className="text-slate-700 font-bold">Medicina attiva nel piano</span>
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3">
          <button 
            type="submit" 
            disabled={isSaving || isDeleting}
            className={`flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold transition shadow-lg shadow-blue-200 ${
              isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
          <button 
            type="button"
            disabled={isSaving || isDeleting}
            onClick={() => {
              setIsEditing(false);
              if (onCancel) onCancel();
            }}
            className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Annulla
          </button>
        </div>
        
        {onDelete && (
          <button 
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
              showDeleteConfirm 
                ? 'bg-red-600 border-red-600 text-white scale-[1.02] shadow-lg shadow-red-100' 
                : 'bg-white border-red-50 text-red-400 hover:border-red-100 hover:text-red-500'
            } disabled:opacity-50`}
          >
            {isDeleting ? 'Eliminazione in corso...' : showDeleteConfirm ? '⚠️ Sicuro? Clicca di nuovo per eliminare' : 'Elimina Medicina'}
          </button>
        )}
      </div>
    </form>
  );
};
