import { useState, useEffect } from 'react';
import apiService from '../services/api';

export function useSimpleData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSolicitations(1, 10, {});
        
        if (response.data && response.data.data) {
          setData(response.data.data);
        } else {
          setData(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar dados');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}
