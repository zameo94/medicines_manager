import { MedicineCreateForm } from './MedicineCreateForm';

export const MedicineModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Nuova Medicina</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>
          <MedicineCreateForm 
            onSubmit={(data) => { onSubmit(data); onClose(); }} 
            onCancel={onClose} 
          />
        </div>
      </div>
    </div>
  );
};
