import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import './academics.css';

export const idOf = (row) => String(row?._id || row?.id || '');
export const errorText = (error) => error?.response?.data?.message || error?.message || 'Try again.';
export const statusLabels = {
  draft: 'Draft', 'in-review': 'In review', published: 'Published', legacy: 'Needs review', unplanned: 'Needs syllabus',
  upcoming: 'Upcoming', 'in-progress': 'In progress', completed: 'Completed',
};
export const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
export const roomLabel = (room) => [room.className, room.sectionName].filter(Boolean).join(' · ');
export const newAcademicId = () => crypto.getRandomValues(new Uint32Array(4)).join('-');

export function useAcademicData(key, load) {
  const loader = useRef(load);
  loader.current = load;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    loader.current(controller.signal).then(
      (data) => { if (!controller.signal.aborted) setResult({ key, revision, data }); },
      (error) => { if (!controller.signal.aborted) setResult({ key, revision, error }); },
    );
    return () => controller.abort();
  }, [key, revision]);
  const current = result?.key === key && (result.revision === revision || result.data) ? result : {};
  return { ...current, loading: Boolean(key && !current.data && !current.error), reload: () => setRevision((value) => value + 1) };
}

export function useAcademicAction() {
  const [state, setState] = useState({ busy: false, error: null, message: '' });
  const running = useRef(false);
  async function run(action, message = '') {
    if (running.current) return false;
    running.current = true;
    setState({ busy: true, error: null, message: '' });
    try {
      await action();
      setState({ busy: false, error: null, message });
      return true;
    } catch (error) {
      setState({ busy: false, error, message: '' });
      return false;
    } finally {
      running.current = false;
    }
  }
  return { ...state, run };
}

export function AcademicHero({ icon: Icon = BookOpen, title, description, actions }) {
  return <header className="academic-hero">
    <div className="academic-hero-main">
      <span className="academic-hero-icon"><Icon size={27} aria-hidden="true" /></span>
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    </div>
    {actions && <div className="academic-actions academic-no-print">{actions}</div>}
  </header>;
}

export function AcademicTabs({ tabs, active, change, label = 'Academic views' }) {
  return <nav className="academic-tabs academic-no-print" aria-label={label}>
    {tabs.map(({ id, label: name, icon: Icon }) => <button type="button" key={id} aria-current={active === id ? 'page' : undefined}
      onClick={() => change(id)}>{Icon && <Icon size={16} aria-hidden="true" />}{name}</button>)}
  </nav>;
}

export function AcademicState({ icon: Icon = BookOpen, title, detail, action }) {
  return <div className="academic-state">
    <span className="academic-icon"><Icon size={22} aria-hidden="true" /></span>
    <h2>{title}</h2>{detail && <p>{detail}</p>}{action}
  </div>;
}

export function AcademicLoad({ state, title = 'Could not load academics' }) {
  if (state.error) return <AcademicState icon={AlertCircle} title={title} detail={errorText(state.error)}
    action={state.reload && <button type="button" className="academic-btn" onClick={state.reload}>Try again</button>} />;
  return <div className="academic-state" role="status"><Loader2 className="animate-spin" size={24} /> Loading…</div>;
}

export function ActionFeedback({ action }) {
  if (!action.error && !action.message) return null;
  return <p className="academic-notice" role={action.error ? 'alert' : 'status'}>{action.error ? errorText(action.error) : action.message}</p>;
}

export function Status({ value, children }) {
  return <span className={'academic-status' + (['published', 'completed', 'in-review', 'in-progress'].includes(value) ? ' academic-status-current' : '')}>
    {children || statusLabels[value] || value}
  </span>;
}

export function Progress({ completed, total }) {
  if (!total) return <span className="academic-muted">No chapters planned</span>;
  return <span className="academic-coverage"><progress max={total} value={completed} aria-label="Chapters completed" />
    <span>{completed} of {total} complete</span></span>;
}

export function NavigateRow({ name, detail, children, onClick }) {
  return <button type="button" className="academic-row academic-navigate" onClick={onClick}>
    <span><strong>{name}</strong>{detail && <small>{detail}</small>}</span>
    <span className="academic-actions">{children}<ArrowRight size={16} aria-hidden="true" /></span>
  </button>;
}

export const bookDetail = (book) => [book.author, book.publisher, book.edition, book.isbn && 'ISBN ' + book.isbn].filter(Boolean).join(' · ');
