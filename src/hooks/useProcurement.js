import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserRole } from '../config/access.jsx';

export function useProcurementAccess() {
  const role = useSelector((state) => getUserRole(state.auth?.user));
  const administrator = ['super-admin', 'school-admin', 'admin'].includes(role);
  return {
    canManageStock: administrator || role === 'accountant',
    canArchive: administrator,
    canAllocate: administrator || role === 'principal',
    canReadBudget: administrator || role === 'principal' || role === 'accountant',
  };
}

export function useProcurementResource(load, enabled = true) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    let current = true;
    load().then(
      (data) => { if (current) setResult({ load, version, data }); },
      (error) => { if (current) setResult({ load, version, error }); }
    );
    return () => { current = false; };
  }, [load, enabled, version]);
  const settled = result?.load === load && result?.version === version;
  return {
    data: settled ? result.data : undefined,
    error: settled ? result.error : undefined,
    loading: enabled && !settled,
    refresh: () => setVersion((value) => value + 1),
  };
}

export function useDebouncedSearch(value) {
  const [search, setSearch] = useState(value.trim());
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(value.trim()), 220);
    return () => clearTimeout(timeout);
  }, [value]);
  return search;
}
