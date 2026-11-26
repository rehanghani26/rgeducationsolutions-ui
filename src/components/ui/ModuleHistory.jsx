import { useId, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, ClipboardList, Layers, LayoutGrid, Link2, List } from 'lucide-react';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';
import { badge, bg, border, card, text } from '../../theme/color.js';

export default function ModuleHistory({
  title, entries, pagination, loading, error, onRetry, onPageChange, renderEntry, filters,
  expanded = true, onExpandChange, renderSummary,
}) {
  const panelId = useId();
  const [view, setView] = useState('timeline');
  const cards = expanded && view === 'cards';
  const count = pagination?.total;
  const countBadge = count != null && <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs ${badge.info}`}>
    <Layers size={14} aria-hidden="true" />{count} {count === 1 ? 'record' : 'records'}
  </span>;

  const historyContent = (
    <>
      <div className={`flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3 ${border.default}`}>
        {filters}
        <div role="group" aria-label="History layout" className={`ml-auto flex gap-1 rounded-xl border p-0.5 ${bg.surfaceSubtle} ${border.default}`}>
          <Button size="sm" variant={view === 'timeline' ? 'outline' : 'ghost'} icon={List}
            aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}>Timeline</Button>
          <Button size="sm" variant={view === 'cards' ? 'outline' : 'ghost'} icon={LayoutGrid}
            aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cards</Button>
        </div>
      </div>
      {loading && <p role="status" className={`p-4 text-sm ${text.secondary}`}>Loading history…</p>}
      {error && <div className="flex flex-wrap items-center gap-2 p-4">
        <p role="alert" className={`text-sm ${text.danger}`}>{error}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </div>}
      {entries && (entries.length ? <HistoryChain entries={entries} cards={cards} renderEntry={renderEntry} />
        : <EmptyState icon={ClipboardList} title="No history recorded" />)}
      {pagination?.pages > 1 && <div className={`flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 ${border.default}`}>
        <p className={`text-xs ${text.secondary}`}>Page {pagination.page} of {pagination.pages}</p>
        <div className="flex gap-2">
          <Button size="xs" variant="secondary" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Previous</Button>
          <Button size="xs" variant="secondary" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</Button>
        </div>
      </div>}
    </>
  );

  if (onExpandChange) {
    return <section aria-label={title} className={`border-t ${border.default} ${bg.header}`}>
      <div id={panelId} hidden={!expanded} aria-busy={loading}
        className={`max-h-[min(56dvh,32rem)] overflow-y-auto border-b ${border.default} ${bg.card}`}>
        {expanded && historyContent}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-2 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-2">
          <Link2 size={16} className={`shrink-0 ${text.brand}`} aria-hidden="true" />
          <h2 className={`truncate text-sm ${text.heading}`}>{title}</h2>
        </div>
        {!expanded && <div aria-live="polite" className={`col-span-2 row-start-2 min-w-0 text-xs md:col-span-1 md:col-start-2 md:row-start-1 md:border-l md:pl-4 ${border.default} ${text.secondary}`}>
          {loading ? 'Loading history…' : error ? (
            <div className="flex items-center gap-2">
              <p role="alert" className={`truncate ${text.danger}`}>{error}</p>
              <Button size="xs" variant="ghost" onClick={onRetry}>Retry</Button>
            </div>
          ) : entries?.length ? renderSummary(entries[0]) : 'No history recorded.'}
        </div>}
        <div className="col-start-2 row-start-1 flex items-center gap-2 md:col-start-3">
          {countBadge && <div className="hidden sm:block">{countBadge}</div>}
          <Button size="xs" variant="outline" icon={expanded ? ChevronDown : ChevronUp}
            aria-expanded={expanded} aria-controls={panelId} onClick={() => onExpandChange(!expanded)}>
            {expanded ? 'Show latest' : 'Expand all'}
          </Button>
        </div>
      </div>
    </section>;
  }

  return <section aria-label={title} className={`${card.base} overflow-hidden`}>
    <div aria-hidden="true" className={`h-1 ${bg.brandGradient}`} />
    <header className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${bg.surfaceSubtle} ${border.default}`}>
      <div className="flex items-center gap-3">
        <span className={`grid size-9 place-items-center rounded-xl border ${bg.brandSubtle} ${border.brand}`}>
          <Link2 size={19} aria-hidden="true" />
        </span>
        <h2 className={`text-base ${text.heading}`}>{title}</h2>
      </div>
      {countBadge}
    </header>
    <div aria-busy={loading}>{historyContent}</div>
  </section>;
}

function HistoryChain({ entries, cards, renderEntry }) {
  return <ol aria-label="History records" tabIndex={cards ? 0 : undefined}
    className={cards ? 'flex snap-x gap-7 overflow-x-auto px-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-5' : 'px-4 py-4 sm:px-5'}>
    {entries.map((entry, index) => {
      const hasNext = index < entries.length - 1;
      return <li key={entry._id} className={cards ? 'relative flex w-56 shrink-0 snap-start scroll-ml-4 sm:scroll-ml-5' : 'relative pb-2 pl-7 last:pb-0 sm:pl-9'}>
        {cards ? hasNext && <>
          <span aria-hidden="true" className={`absolute -right-7 top-1/2 w-7 border-t-2 ${border.brand}`} />
          <span aria-hidden="true"
            className={`absolute -right-6 top-1/2 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full border ${bg.card} ${border.brand} ${text.brand}`}>
            <ChevronRight size={13} />
          </span>
        </> : <>
          {hasNext && <span aria-hidden="true" className={`absolute left-[6px] top-6 h-full border-l-2 ${border.brand}`} />}
          <span aria-hidden="true" className={`absolute left-[6px] top-6 w-[22px] border-t-2 sm:w-[30px] ${border.brand}`} />
          <span aria-hidden="true" className={`absolute left-0 top-[18px] size-3.5 rounded-full border-2 ${border.brandActive} ${index === 0 ? bg.brand : bg.card}`} />
        </>}
        {renderEntry(entry, { cards })}
      </li>;
    })}
  </ol>;
}
