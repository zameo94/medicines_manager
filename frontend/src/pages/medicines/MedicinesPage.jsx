import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMedicines } from '../../features/medicines/hooks/useMedicines';
import { MedicineItem } from '../../features/medicines/components/MedicineItem';
import { MedicineModal } from '../../features/medicines/components/MedicineModal';

export default function MedicinesPage() {
  const { medicines, loading, isSaving, saveError, isDeleting, deleteError, remove, save } = useMedicines();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Le mie Medicine</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-sm md:text-base"
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
