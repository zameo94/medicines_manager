import { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api';

export const useMedicine = (id) => {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedicine = async () => {
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
  };

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  return { medicine, loading, error, update, remove, isSaving, saveError, isDeleting, deleteError, refresh: fetchMedicine };
};
