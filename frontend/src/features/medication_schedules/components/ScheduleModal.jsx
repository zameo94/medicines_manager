import { ScheduleForm } from './ScheduleForm';

export const ScheduleModal = ({ isOpen, onClose, onSubmit, isSaving = false, error = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800">Nuova Programmazione</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <ScheduleForm 
          onSave={async (data) => {
            await onSubmit(data);
            onClose();
          }} 
          onCancel={onClose}
          isSaving={isSaving}
          error={error}
        />
      </div>
    </div>
  );
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
