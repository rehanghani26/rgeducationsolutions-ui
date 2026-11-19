import { AcademicSessionSetupForm } from '../../../components/modals/MandatorySchoolProfileModal.jsx';

export default function Step2AcademicSession({ onComplete, onNext }) {
  return <AcademicSessionSetupForm onComplete={async () => {
    await onComplete?.();
    onNext?.();
  }} />;
}
