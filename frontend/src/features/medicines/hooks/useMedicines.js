import { useState, useEffect } from 'react';
import { medicineService } from '../../../services/api';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

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
    await medicineService.delete(id);
    refresh();
  };

  const save = async (data, id = null) => {
    if (id) {
      await medicineService.update(id, data);
    } else {
      await medicineService.create(data);
    }
    refresh();
  };

  return { medicines, loading, remove, save };
};