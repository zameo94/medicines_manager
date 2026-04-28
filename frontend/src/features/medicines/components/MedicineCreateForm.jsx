import { useState, useEffect } from 'react';

export const MedicineCreateForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        name: initialData.name, 
        description: initialData.description || '',
        is_active: initialData.is_active 
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', description: '', is_active: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <input 
          className="p-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          placeholder="Nome Medicina"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
        />
        <textarea 
          className="p-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 min-h-[120px]"
          placeholder="Descrizione"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        
        <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
          <input 
            type="checkbox"
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={formData.is_active}
            onChange={e => setFormData({...formData, is_active: e.target.checked})}
          />
          <span className="text-slate-700 font-medium">Medicina attiva nel piano</span>
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          {initialData ? 'Aggiorna' : 'Salva Medicina'}
        </button>
      </div>
    </form>
  );
};