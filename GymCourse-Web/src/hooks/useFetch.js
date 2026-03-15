import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { HTTP_STATUS } from '../utils/constants';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const { immediate = true, method = 'GET', body = null, headers = {} } = options;

  const execute = useCallback(async (customOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method: customOptions.method || method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...customOptions.headers,
        },
        ...(customOptions.body || body ? { body: JSON.stringify(customOptions.body || body) } : {}),
      };

      const response = await api(customOptions.url || url, config);
      setStatus(response.status);
      
      let responseData;
      if (response.status === HTTP_STATUS.OK || response.status === HTTP_STATUS.CREATED) {
        responseData = response.data;
        setData(responseData);
      }
      
      return { success: true, data: responseData, status: response.status };
    } catch (err) {
      const errorMessage = err.response?.data || err.message || 'Request failed';
      setError(errorMessage);
      setStatus(err.response?.status);
      return { success: false, error: errorMessage, status: err.response?.status };
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    status,
    execute,
    setData,
  };
};