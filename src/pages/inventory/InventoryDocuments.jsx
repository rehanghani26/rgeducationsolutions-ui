import { ChevronDown, FileText, X } from 'lucide-react';
import { Field } from '../../components/ui/ProcurementUI.jsx';
import { ADDITIONAL_ATTACHMENT_ACCEPT } from '../../constants/inventoryOptions.js';
import { inventoryAttachmentUrl } from '../../services/inventoryService.js';
import { MAX_ITEM_DOCUMENTS } from '../../utils/inventoryDraft.js';

export default function InventoryDocuments({ attachments, files, onFilesChange, onRemoveAttachment }) {
  const total = attachments.length + files.length;
  return <details className="proc-panel inventory-documents">
    <summary>
      <FileText size={16} aria-hidden="true" />
      Item documents{total > 0 ? ' (' + total + ')' : ''}
      <ChevronDown size={16} aria-hidden="true" />
    </summary>
    <div className="inventory-documents__content">
      {!!total && <ul>
        {attachments.map((attachment, index) => {
          const filename = attachment.originalName || attachment.filename || 'Attachment';
          return <li key={attachment.url + index}>
            <a className="proc-link" href={inventoryAttachmentUrl(attachment.url)} target="_blank" rel="noopener noreferrer">{filename}</a>
            <button className="proc-btn proc-btn-sm" type="button" aria-label={'Remove ' + filename} onClick={() => onRemoveAttachment(index)}>
              <X size={14} aria-hidden="true" />
            </button>
          </li>;
        })}
        {files.map((file, index) => <li key={file.name + index}>
          <span>{file.name}</span>
          <button className="proc-btn proc-btn-sm" type="button" aria-label={'Remove ' + file.name}
            onClick={() => onFilesChange(files.filter((_, position) => position !== index))}><X size={14} aria-hidden="true" /></button>
        </li>)}
      </ul>}
      {total < MAX_ITEM_DOCUMENTS && <Field label="Attach documents" hint={'Up to ' + (MAX_ITEM_DOCUMENTS - total) + ' more files'}>
        <input type="file" multiple accept={ADDITIONAL_ATTACHMENT_ACCEPT} onChange={(event) => {
          const selected = Array.from(event.target.files).slice(0, MAX_ITEM_DOCUMENTS - total);
          onFilesChange([...files, ...selected]);
          event.target.value = '';
        }} />
      </Field>}
    </div>
  </details>;
}
