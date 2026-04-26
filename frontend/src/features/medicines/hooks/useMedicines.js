import { useState, useEffect, useCallback } from 'react';
import { medicineService } from '../../../services/api';

const parseBackendError = (err, fallbackMessage) => {
  const responseData = err.response?.data;
  if (!responseData) return fallbackMessage;

  if (Array.isArray(responseData.detail)) {
    return responseData.detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ");
  }

  if (typeof responseData.detail === 'string') {
    return responseData.detail;
  }

  return responseData.message || fallbackMessage;
};

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
      setDeleteError(parseBackendError(err, "Errore durante l'eliminazione"));
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
      setSaveError(parseBackendError(err, "Errore durante il salvataggio"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { medicines, loading, isSaving, saveError, isDeleting, deleteError, remove, save, refresh };
};

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
      setSaveError(parseBackendError(err, "Errore durante il salvataggio"));
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
      setDeleteError(parseBackendError(err, "Errore durante l'eliminazione"));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { medicine, loading, error, update, remove, isSaving, saveError, isDeleting, deleteError, refresh: fetchMedicine };
};
