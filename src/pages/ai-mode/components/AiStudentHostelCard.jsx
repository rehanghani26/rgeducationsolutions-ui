import { HostelPlacement } from '../../hostel/HostelPlacement.jsx';

export default function AiStudentHostelCard({ student, hostel }) {
  return <HostelPlacement allocation={hostel.allocation} subtitle={student?.name} />;
}
