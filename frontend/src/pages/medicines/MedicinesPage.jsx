import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMedicines } from '../../features/medicines/hooks/useMedicines';
import { MedicineItem } from '../../features/medicines/components/MedicineItem';
import { MedicineModal } from '../../features/medicines/components/MedicineModal';

export default function MedicinesPage() {
  const { medicines, loading, isSaving, saveError, isDeleting, deleteError, remove, save } = useMedicines();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-end mb-10">
        <div>
          <Link to="/" className="text-slate-400 hover:text-slate-600 mb-2 block text-sm font-medium">← Dashboard</Link>
          <h1 className="text-4xl font-black text-slate-900">Le mie Medicine</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all"
        >
          + Aggiungi Medicina
        </button>
      </header>

      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
          ⚠️ {saveError}
        </div>
      )}

      {deleteError && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
          ⚠️ {deleteError}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {medicines.map(m => (
            <MedicineItem 
              key={m.id} 
              medicine={m} 
              onUpdate={(id, data) => save(data, id)} 
              onDelete={remove}
              isSaving={isSaving}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      <MedicineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={(data) => save(data)} 
      />
    </div>
  );
}
