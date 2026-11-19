import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function useDashboardOverview(path) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ data: null, error: '', loading: true });

  useEffect(() => {
    const requests = new AbortController();
    setState({ data: null, error: '', loading: true });
    api.get(path, { signal: requests.signal }).then((response) => {
      if (requests.signal.aborted) return;
      if (!response.data?.data) throw new Error('The dashboard did not return any data.');
      setState({ data: response.data.data, error: '', loading: false });
    }).catch((error) => {
      if (!requests.signal.aborted) {
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || error.message || 'Unable to load dashboard data.',
        });
      }
    });
    return () => requests.abort();
  }, [path, version]);

  return { ...state, reload: () => setVersion((current) => current + 1) };
}
