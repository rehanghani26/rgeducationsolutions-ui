import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { SelectInput } from '../../components/ui/FormControls.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { getPublishedSyllabuses } from '../../services/syllabusService.js';
import { AcademicHero, AcademicLoad, AcademicState, useAcademicData } from './AcademicUI.jsx';
import { BookList } from './AcademicBooks.jsx';

export default function LibraryBookLists() {
  const { sessionId, sessionsLoading, sessionsError } = useAcademicSession();
  const [classId, setClassId] = useState('');
  const data = useAcademicData(sessionId && sessionId !== 'legacy' ? sessionId : '', getPublishedSyllabuses);
  const plans = data.data?.syllabuses || [];
  const syllabus = plans.find((row) => row.classId === classId) || plans[0];
  return <div className="academic-workspace">
    <AcademicHero icon={BookOpen} title="Prescribed book lists" description="Browse and print the books published for each class." />
    {(sessionsLoading || sessionsError || data.loading || data.error) && <AcademicLoad state={sessionsError ? { error: sessionsError } : data} />}
    {syllabus && <>
      <div className="academic-panel"><SelectInput label="Class" value={syllabus.classId} onChange={(event) => setClassId(event.target.value)}
        options={plans.map((row) => ({ value: row.classId, label: row.className }))} /></div>
      <BookList subjects={syllabus.subjects} context={syllabus.className + ' · ' + syllabus.academicYear} />
    </>}
    {!sessionsLoading && !sessionsError && !data.loading && !data.error && !syllabus && <AcademicState title="No published book lists for this session" />}
  </div>;
}
