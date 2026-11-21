import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api, { setAcademicSessionId } from '../services/api.js';
import { SECTION_OPTIONS } from '../constants/academicOptions.js';

const AcademicSessionContext = createContext(null);
const idOf = (session) => session?._id || session?.id || '';

export function AcademicSessionProvider({ children }) {
  const [sessionList, setSessionList] = useState({ sessions: [], loading: true, error: null });
  const [choice, setChoice] = useState('');
  const [schoolClasses, setSchoolClasses] = useState({ classRange: null, classes: [], loading: true, error: null });
  const sessionRequest = useRef(0);
  const classRequest = useRef(0);
  const { sessions, loading: sessionsLoading, error: sessionsError } = sessionList;
  const active = sessions.find((session) => session.isCurrent);
  const selected = choice === 'legacy' ? null : sessions.find((session) => idOf(session) === choice) || active;
  const sessionId = choice === 'legacy' ? choice : idOf(selected);

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
      setAcademicSessionId('');
    };
  }, [refresh, refreshSchoolClasses]);

  const choose = useCallback((id) => {
    // Set the request scope before any children fetch for the new selection.
    setAcademicSessionId(id);
    setChoice(id);
  }, []);

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
    sessions, sessionsLoading, sessionsError, active, selected, sessionId, choice, choose, refresh,
    classOptions, combinedClassOptions, schoolClasses, refreshSchoolClasses,
    readOnly: choice === 'legacy' || Boolean(selected && !selected.isCurrent),
  }}>{children}</AcademicSessionContext.Provider>;
}

export const useAcademicSession = () => useContext(AcademicSessionContext);

export function AcademicSessionSelector({ showLegacy }) {
  const { sessions, choice, choose } = useAcademicSession();
  if (!sessions.length) return null;
  return (
    <select aria-label="Academic session" value={choice} onChange={(event) => choose(event.target.value)}
      className="max-w-40 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900">
      <option value="">Active session</option>
      {sessions.map((session) => (
        <option key={idOf(session)} value={idOf(session)}>
          {session.sessionName} ({session.isCurrent ? 'Active' : session.status === 'completed' ? 'Completed' : 'Upcoming'})
        </option>
      ))}
      {showLegacy && <option value="legacy">Legacy / Unassigned</option>}
    </select>
  );
}
