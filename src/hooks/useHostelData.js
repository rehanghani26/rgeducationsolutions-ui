import { useCallback, useEffect, useState } from 'react';
import { readHostel } from '../services/hostelService.js';

export default function useHostelData(path, { sessionId, account, enabled = true } = {}) {
  const [state, setState] = useState(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const key = JSON.stringify([path, sessionId, account, version]);

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    readHostel(path, { sessionId, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ key, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ key, error });
      });
    return () => controller.abort();
  }, [enabled, key, path, sessionId]);

  const current = enabled && state?.key === key ? state : null;
  return { data: current?.data, error: current?.error, loading: enabled && !current, reload };
}
