import { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const refresh = async () => {
    try {
      const res = await medicineService.getAll();
      setMedicines(res.data);
    } catch (err) {
      console.error("Errore fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const remove = async (id) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await medicineService.delete(id);
      await refresh();
    } catch (err) {
      const message = err.response?.data?.detail || "Errore durante l'eliminazione";
      setDeleteError(message);
      console.error("Errore eliminazione:", err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const save = async (data, id = null) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      if (id) {
        await medicineService.update(id, data);
      } else {
        await medicineService.create(data);
      }
      await refresh();
    } catch (err) {
      const message = err.response?.data?.detail || "Errore durante il salvataggio";
      setSaveError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { medicines, loading, isSaving, saveError, isDeleting, deleteError, remove, save };
};
