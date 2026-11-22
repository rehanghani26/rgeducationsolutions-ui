import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api.js';
import { SECTION_OPTIONS } from '../constants/academicOptions.js';

const AcademicSessionContext = createContext(null);
const idOf = (session) => session?._id || session?.id || '';

export function AcademicSessionProvider({ children }) {
  const [sessionList, setSessionList] = useState({ sessions: [], loading: true, error: null });
  const [schoolClasses, setSchoolClasses] = useState({ classRange: null, classes: [], loading: true, error: null });
  const sessionRequest = useRef(0);
  const classRequest = useRef(0);
  const { sessions, loading: sessionsLoading, error: sessionsError } = sessionList;
  const active = sessions.find((session) => session.isCurrent);
  const sessionId = idOf(active);

  const refresh = useCallback(async () => {
    const request = ++sessionRequest.current;
    setSessionList((current) => current.error ? { ...current, loading: true, error: null } : current);
    try {
      const { data } = await api.get('/sessions');
      const rows = data?.data?.sessions ?? data?.sessions;
      if (data?.success === false || !Array.isArray(rows)) {
        throw new Error(data?.message || 'Academic sessions could not be loaded.');
      }
      if (request === sessionRequest.current) setSessionList({ sessions: rows, loading: false, error: null });
    } catch (error) {
      if (request === sessionRequest.current) setSessionList((current) => ({ ...current, loading: false, error }));
      throw error;
    }
  }, []);

  const refreshSchoolClasses = useCallback(async () => {
    const request = ++classRequest.current;
    try {
      const { data } = await api.get('/erp/school-class-range');
      const { classRange = null, classes = [] } = data.data || {};
      if (request === classRequest.current) setSchoolClasses({ classRange, classes, loading: false, error: null });
    } catch (error) {
      if (request === classRequest.current) setSchoolClasses((current) => ({ ...current, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    refreshSchoolClasses();
    const timer = window.setInterval(() => {
      refresh().catch(() => {});
      refreshSchoolClasses();
    }, 60_000);
    return () => {
      sessionRequest.current += 1;
      classRequest.current += 1;
      window.clearInterval(timer);
    };
  }, [refresh, refreshSchoolClasses]);

  const classOptions = useMemo(() => schoolClasses.classes.map(({ id, name, aliases, code }) =>
    ({ id, name, label: name, value: name, aliases, code })), [schoolClasses.classes]);

  const combinedClassOptions = useMemo(() => classOptions.flatMap((grade) =>
    SECTION_OPTIONS.map((section) => {
      const label = grade.name + ' - ' + section.name;
      return {
        label, value: label, classSectionKey: label,
        classId: grade.id, className: grade.name, sectionId: section.id, sectionName: section.name,
        key: grade.id + '_' + section.id,
      };
    })
  ), [classOptions]);

  return <AcademicSessionContext.Provider value={{
    sessions, sessionsLoading, sessionsError, active, selected: active, sessionId, refresh,
    classOptions, combinedClassOptions, schoolClasses, refreshSchoolClasses,
    readOnly: !active,
  }}>{children}</AcademicSessionContext.Provider>;
}

export const useAcademicSession = () => useContext(AcademicSessionContext);
