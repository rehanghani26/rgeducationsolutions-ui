import { createPortal } from 'react-dom';
import { BookOpen, Printer } from 'lucide-react';
import { AcademicState, bookDetail } from './AcademicUI.jsx';

export function BookList({ subjects, title = 'Prescribed books', context, showAvailability = false }) {
  const entries = subjects.filter((subject) => subject.books?.length);
  if (!entries.length) return <AcademicState icon={BookOpen} title="No prescribed books" detail="Books will appear here after the school publishes its list." />;
  return <section className="academic-panel academic-compact">
    <div className="academic-panel-head"><h2>{title}</h2>
      <button type="button" className="academic-btn academic-no-print" onClick={() => window.print()}>
        <Printer size={15} aria-hidden="true" /> Print book list
      </button>
    </div>
    {entries.map((subject) => <div className="academic-compact" key={subject.subjectId}>
      <h3>{subject.subjectName}</h3>
      {subject.books.map((book, index) => <div className="academic-row academic-book" key={index}>
        <span><strong>{book.title}</strong>{bookDetail(book) && <small>{bookDetail(book)}</small>}</span>
        <span className="academic-actions"><span className="academic-status">{book.required ? 'Required' : 'Recommended'}</span>
          {showAvailability && book.availableCopies != null && <span className="academic-status">
            {book.availableCopies ? book.availableCopies + ' available at library' : 'No library copies available'}
          </span>}
        </span>
      </div>)}
    </div>)}
    {createPortal(<article className="academic-book-print">
      <h1>{title}</h1><p>{context}</p>
      {entries.map((subject) => <section key={subject.subjectId}><h2>{subject.subjectName}</h2><ul>
        {subject.books.map((book, index) => <li key={index}>{book.title}
          {bookDetail(book) && ' · ' + bookDetail(book)} · {book.required ? 'Required' : 'Recommended'}
        </li>)}
      </ul></section>)}
    </article>, document.body)}
  </section>;
}
