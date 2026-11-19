import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAcademicSessionId } from '../services/api.js';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions.js';

const AcademicSessionContext = createContext(null);
const idOf = (session) => session?._id || session?.id || '';

export function AcademicSessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [choice, setChoice] = useState('');
  const [loadedClasses, setLoadedClasses] = useState(null);
  const active = sessions.find((session) => session.isCurrent);
  const selected = choice === 'legacy' ? null : sessions.find((session) => idOf(session) === choice) || active;
  const sessionId = choice === 'legacy' ? choice : idOf(selected);

  const refresh = useCallback(async () => {
    const { data } = await api.get('/sessions');
    setSessions(data.sessions || []);
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    const timer = window.setInterval(() => refresh().catch(() => {}), 60_000);
    return () => {
      window.clearInterval(timer);
      setAcademicSessionId('');
    };
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    if (selected?.classIds?.length) {
      api.get('/sessions/' + idOf(selected) + '/classes').then(({ data }) => {
        if (mounted) setLoadedClasses({ sessionId, rows: data.classes || [] });
      }).catch(() => { if (mounted) setLoadedClasses({ sessionId, rows: [] }); });
    }
    return () => { mounted = false; };
  }, [selected, sessionId]);

  const choose = useCallback((id) => {
    // Set the request scope before any children fetch for the new selection.
    setAcademicSessionId(id);
    setChoice(id);
  }, []);

  const classOptions = useMemo(() => {
    if (choice === 'legacy') return [];
    if (!selected?.classIds?.length) return CLASS_OPTIONS.filter((grade) => !grade.isPassout);
    if (loadedClasses?.sessionId !== sessionId) return [];
    return loadedClasses.rows.map(({ id, name, aliases, code }) => ({ id, name, label: name, value: name, aliases, code }));
  }, [choice, loadedClasses, selected, sessionId]);

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
    sessions, active, selected, sessionId, choice, choose, refresh, classOptions, combinedClassOptions,
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
