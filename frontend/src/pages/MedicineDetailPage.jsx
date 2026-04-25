import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMedicine } from '../features/medicines/hooks/useMedicine';
import { MedicineForm } from '../features/medicines/components/MedicineForm';

export default function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { medicine, loading, error, update } = useMedicine(id);

  if (loading) return (
    <div className="max-w-2xl mx-auto p-10 text-center text-slate-400 font-medium animate-pulse">
      Caricamento...
    </div>
  );

  if (error || !medicine) return (
    <div className="max-w-2xl mx-auto p-10 text-center">
      <p className="text-red-500 font-bold mb-4">Errore nel caricamento della medicina.</p>
      <Link to="/medicines" className="text-blue-600 hover:underline">Torna alla lista</Link>
    </div>
  );

  const handleSave = async (data) => {
    try {
      await update(data);
      navigate('/medicines');
    } catch (err) {
      alert("Errore durante il salvataggio");
    }
  };

  const isInitiallyEditing = new URLSearchParams(window.location.search).get('edit') === 'true';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="mb-8">
        <Link to="/medicines" className="text-slate-400 hover:text-slate-600 mb-2 block text-sm font-medium">
          ← Torna alle medicine
        </Link>
        <h1 className="text-3xl font-black text-slate-900">
          {medicine.name}
        </h1>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <MedicineForm 
          medicine={medicine} 
          isEditing={isInitiallyEditing}
          onSave={handleSave}
          onCancel={() => navigate(`/medicines/${id}`, { replace: true })}
        />
      </div>
    </div>
  );
}
