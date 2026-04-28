import { useState, useEffect, useCallback } from 'react';
import { logService } from '../../../services/api';

export const useMedicationLogs = () => {
  const [schedules, setSchedules] = useState([]);
  const [referenceDate, setReferenceDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await logService.getMain();
      setSchedules(response.data.schedules);
      setReferenceDate(response.data.reference_date);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento della dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLog = async (schedule, isTaken) => {
    try {
      if (schedule.current_log) {
        await logService.update(schedule.current_log.id, {
          is_taken: isTaken,
          reference_date: referenceDate,
          schedule_id: schedule.id
        });
      } else {
        await logService.create({
          schedule_id: schedule.id,
          reference_date: referenceDate,
          is_taken: isTaken
        });
      }
      await fetchDashboard();
    } catch (err) {
      console.error('Errore nel salvataggio del log:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    schedules,
    referenceDate,
    loading,
    error,
    saveLog,
    refresh: fetchDashboard
  };
};
