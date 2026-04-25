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

  const update = async (data) => {
    try {
      const res = await medicineService.update(id, data);
      setMedicine(res.data);
      return res.data;
    } catch (err) {
      console.error("Errore update medicina:", err);
      throw err;
    }
  };

  return { medicine, loading, error, update, refresh: fetchMedicine };
};
