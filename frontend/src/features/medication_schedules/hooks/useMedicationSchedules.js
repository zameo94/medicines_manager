import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../../../services/api';

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

export const useMedicationSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getAll();
      setSchedules(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = async (id) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await scheduleService.delete(id);
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
        await scheduleService.update(id, data);
      } else {
        await scheduleService.create(data);
      }
      await refresh();
    } catch (err) {
      setSaveError(parseBackendError(err, "Errore durante il salvataggio"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { schedules, loading, error, isDeleting, deleteError, isSaving, saveError, remove, save, refresh };
};

export const useMedicationSchedule = (id) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchSchedule = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await scheduleService.getById(id);
      setSchedule(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const update = async (data) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      const res = await scheduleService.update(id, data);
      setSchedule(res.data);
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
      await scheduleService.delete(id);
    } catch (err) {
      setDeleteError(parseBackendError(err, "Errore durante l'eliminazione"));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { 
    schedule, 
    loading, 
    error, 
    update, 
    remove, 
    isSaving, 
    saveError, 
    isDeleting, 
    deleteError, 
    refresh: fetchSchedule 
  };
};
