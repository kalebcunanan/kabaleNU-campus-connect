import { useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../lib/axios';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useAxiosFetch = <T,>(url: string) => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async (isRefetch = false) => {
    setState(prev => ({ ...prev, loading: !isRefetch, error: null }));
    try {
      const response = await api.get<T>(url);
      setState({ data: response.data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: getErrorMessage(error) 
      }));
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return { ...state, refetch };
};