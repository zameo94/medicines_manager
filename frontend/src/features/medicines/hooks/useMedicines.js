import { useState, useEffect, useCallback } from 'react';
import { medicineService } from '../../../services/api';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await medicineService.getAll();
      setMedicines(res.data);
    } catch (err) {
      console.error("Errore fetch lista:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (id) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await medicineService.delete(id);
      await refresh();
    } catch (err) {
      const message = err.response?.data?.detail || "Errore durante l'eliminazione";
      setDeleteError(message);
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

  return { medicines, loading, isSaving, saveError, isDeleting, deleteError, remove, save, refresh };
};

/**
 * Hook per la gestione di una singola medicina
 */
export const useMedicine = (id) => {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchMedicine = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await medicineService.getById(id);
      setMedicine(res.data);
      setError(null);
    } catch (err) {
      console.error("Errore fetch medicina:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMedicine();
  }, [fetchMedicine]);

  const update = async (data) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      const res = await medicineService.update(id, data);
      setMedicine(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.detail || "Errore durante il salvataggio";
      setSaveError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await medicineService.delete(id);
    } catch (err) {
      const message = err.response?.data?.detail || "Errore durante l'eliminazione";
      setDeleteError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { 
    medicine, 
    loading, 
    error, 
    update, 
    remove, 
    isSaving, 
    saveError, 
    isDeleting, 
    deleteError, 
    refresh: fetchMedicine 
  };
};
