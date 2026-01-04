import { useEffect, useState, useCallback } from 'react';

const useFetch = (apiFunc, params = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (overrideParams) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFunc(overrideParams ?? params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, params]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
};

export default useFetch;
