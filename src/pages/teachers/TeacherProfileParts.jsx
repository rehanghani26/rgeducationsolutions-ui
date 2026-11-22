import { useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../components/ui/Modal.jsx';
import { getTeacherFile } from '../../services/teacherService.js';
import { notifyApiError } from '../../services/apiErrors.js';

export function TeacherAvatar({ teacher, file }) {
  const [url, setUrl] = useState('');
  const id = teacher?._id || teacher?.id;
  const photoName = teacher?.photoName;
  useEffect(() => {
    const request = new AbortController();
    let objectUrl;
    setUrl('');
    if (file || (id && photoName)) {
      const image = file ? Promise.resolve(file) : getTeacherFile(id, 'photo', request.signal);
      image.then((blob) => {
        if (request.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }).catch(() => {});
    }
    return () => {
      request.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, id, photoName]);
  return <span className="teacher-avatar">
    {url ? <img src={url} alt={teacher?.name ? teacher.name + ' profile photo' : 'Teacher photo preview'} /> : <UserRound size={25} aria-hidden="true" />}
  </span>;
}

export function TeacherFacts({ items }) {
  return <dl className="teacher-facts">
    {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value == null || value === '' ? '—' : value}</dd></div>)}
  </dl>;
}

export function TeacherCredentialsDialog({ account, onClose, created = false }) {
  const [visible, setVisible] = useState(false);
  const username = account.username || account.employeeId;
  const password = account.temporaryPassword || account.password;
  async function copy() {
    try {
      await navigator.clipboard.writeText(['Username ' + username, 'Email ' + account.email, 'Password ' + password].join('\n'));
      toast.success('Login details copied.');
    } catch (error) {
      notifyApiError(error, 'Could not copy login details.');
    }
  }
  return <Modal open title={created ? 'Teacher registered' : 'Teacher login details'} size="sm" onClose={onClose}
    footer={<button type="button" className="proc-btn proc-primary" onClick={onClose}>{created ? 'Open profile' : 'Done'}</button>}>
    <TeacherFacts items={[['Username', username], ['Email', account.email], ['Password', password ? (visible ? password : '••••••••') : '—']]} />
    {password && <div className="proc-actions mt-4">
      <button type="button" className="proc-btn" aria-pressed={visible} onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}{visible ? 'Hide password' : 'Show password'}
      </button>
      <button type="button" className="proc-btn" onClick={copy}><Copy size={15} /> Copy login details</button>
    </div>}
  </Modal>;
}
