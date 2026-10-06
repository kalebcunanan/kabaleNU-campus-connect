import { useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { AxiosError } from 'axios';

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

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await axiosInstance.get<T>(url);
        if (isMounted) setState({ data: response.data, loading: false, error: null });
      } catch (error) {
        if (isMounted) {
          const err = error as AxiosError<{ message: string }>;
          setState({ 
            data: null, 
            loading: false, 
            error: err.response?.data?.message || 'An unexpected error occurred' 
          });
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
};