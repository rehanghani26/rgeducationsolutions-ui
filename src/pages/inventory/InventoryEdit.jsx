import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Empty, ErrorMessage, Field, Pending } from '../../components/ui/ProcurementUI.jsx';
import { useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { ROUTES } from '../../routes/routes.js';
import { createBulkInventoryItems, createInventoryItem, getInventoryById, updateInventoryItem, uploadInventoryFiles } from '../../services/inventoryService.js';
import { makeInventoryDraft, MAX_CATALOG_ITEMS, openingStockValue, validateInventoryDrafts } from '../../utils/inventoryDraft.js';
import { recordId } from '../../utils/procurement.js';
import InventoryDocuments from './InventoryDocuments.jsx';
import InventoryItemEditor from './InventoryItemEditor.jsx';
import InventoryPresetCatalog from './InventoryPresetCatalog.jsx';
import InventorySelection, { InventoryMobileSelection } from './InventorySelection.jsx';
import './inventoryEditor.css';

function InventoryPageHeader({ editing, item, actions }) {
  return <PageHeader title={editing ? 'Edit inventory item' : 'Add inventory items'}
    subtitle={editing ? item?.name : 'Browse school supplies or create a custom item for your inventory.'}
    breadcrumbs={[{ label: 'Inventory', to: ROUTES.INVENTORY.LIST }, { label: editing ? 'Edit item' : 'Add items' }]}
    actions={actions} />;
}

function CatalogWorkspace({ item }) {
  const navigate = useNavigate();
  const editing = Boolean(item);
  const back = editing ? ROUTES.INVENTORY.detail(recordId(item)) : ROUTES.INVENTORY.LIST;
  const [rows, setRows] = useState(() => item ? [makeInventoryDraft(item)] : []);
  const [activeKey, setActiveKey] = useState(null);
  const [review, setReview] = useState(false);
  const [attachments, setAttachments] = useState(item?.additionalAttachments || []);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState(null);
  const form = useRef(null);
  const focusAfterRender = useRef(null);

  const reviewing = editing || review;
  const active = rows.find((row) => row.key === activeKey) || rows[0];
  const full = rows.length >= MAX_CATALOG_ITEMS;
  const selections = new Map(rows.filter((row) => row.presetId).map((row) => [row.presetId, row.key]));
  const stockValue = openingStockValue(rows);

  useEffect(() => {
    const selector = focusAfterRender.current;
    if (!selector) return;
    focusAfterRender.current = null;
    const target = form.current?.querySelector(selector);
    if (!target) return;
    const collapsed = target.closest('details');
    if (collapsed) collapsed.open = true;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'nearest' });
  }, [reviewing, active?.key, issue]);

  function openItem(key, focus = '#inventory-item-heading') {
    if (!key) return;
    if (!reviewing || key !== active?.key) focusAfterRender.current = focus;
    setActiveKey(key);
    setReview(true);
  }

  function addPreset(preset) {
    if (full || selections.has(preset.id)) return;
    const row = makeInventoryDraft({ ...preset, unitCost: preset.unitPrice }, preset.id);
    setRows((current) => current.length >= MAX_CATALOG_ITEMS || current.some((entry) => entry.presetId === preset.id)
      ? current : [...current, row]);
    setActiveKey(row.key);
    setError(null);
  }

  function addCustom() {
    if (full) return;
    const row = makeInventoryDraft();
    setRows((current) => [...current, row]);
    openItem(row.key, '[data-inventory-field="name"]');
    setIssue(null);
    setError(null);
  }

  function browse() {
    focusAfterRender.current = '.inventory-catalog input[type="search"]';
    setReview(false);
    setIssue(null);
    setError(null);
  }

  function removeItem(key) {
    const remaining = rows.filter((row) => row.key !== key);
    setRows(remaining);
    if (key === active?.key) setActiveKey(remaining[0]?.key || null);
    if (!remaining.length && reviewing) browse();
    if (issue?.key === key) setIssue(null);
    setError(null);
  }

  function changeItem(key, values, vendor) {
    setRows((current) => current.map((row) => row.key === key ? {
      ...row,
      values: { ...row.values, ...values },
      ...(vendor !== undefined ? { vendor } : {}),
    } : row));
    const fixesStockBounds = issue?.field === 'maxStockLevel' && Object.hasOwn(values, 'minStockLevel');
    if (issue?.key === key && (Object.hasOwn(values, issue.field) || fixesStockBounds)) {
      setIssue(null);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!reviewing || saving || !rows.length) return;
    setError(null);
    const problem = validateInventoryDrafts(rows, editing);
    setIssue(problem);
    if (problem) {
      focusAfterRender.current = '[data-inventory-field="' + problem.field + '"]';
      setActiveKey(problem.key);
      return;
    }

    setSaving(true);
    try {
      const uploaded = files.length ? await uploadInventoryFiles(files) : [];
      const additionalAttachments = [...attachments, ...uploaded];
      if (files.length) {
        setAttachments(additionalAttachments);
        setFiles([]);
      }
      const items = rows.map(({ values }) => ({ ...values, additionalAttachments }));
      if (editing) {
        const changes = items[0];
        delete changes.quantity;
        await updateInventoryItem(recordId(item), changes);
      } else if (items.length === 1) {
        await createInventoryItem(items[0]);
      } else {
        await createBulkInventoryItems({ items });
      }
      navigate(back);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return <div className={'proc-page inventory-workspace' + (rows.length > 0 ? ' inventory-workspace--selected' : '')}>
    <InventoryPageHeader editing={editing} item={item} actions={editing ?
      <Link className="proc-btn" to={back}><ArrowLeft size={15} /> Cancel</Link> : <>
      {reviewing && <button className="proc-btn" type="button" onClick={browse} disabled={saving}><ArrowLeft size={15} /> Back to catalog</button>}
      <button className={'proc-btn' + (reviewing ? '' : ' proc-primary')} type="button" disabled={full || saving} onClick={addCustom}>
        <Plus size={16} /> Add custom item
      </button>
    </>} />
    <form ref={form} onSubmit={save} noValidate onKeyDown={(event) => {
      if (event.key === 'Enter' && event.target.type === 'search') event.preventDefault();
    }}>
      <div className="inventory-workspace__layout" aria-busy={saving || undefined}>
        <div className="inventory-workspace__main">
          {!editing && <div hidden={reviewing}>
            <InventoryPresetCatalog selections={selections} full={full} onAdd={addPreset} onEdit={openItem} />
          </div>}
          {reviewing && active && <fieldset className="inventory-workspace__fields" disabled={saving}><div className="inventory-workspace__review">
            {!editing && rows.length > 1 && <div className="proc-panel inventory-workspace__switch">
              <Field label="Editing item">
                <select value={active.key} onChange={(event) => openItem(event.target.value)}>
                  {rows.map((row) => <option value={row.key} key={row.key}>{row.values.name || 'Custom item'}</option>)}
                </select>
              </Field>
            </div>}
            {item?.legacyBundle && <p className="proc-message proc-warn">The original bundle contents are available in the item history.</p>}
            <ErrorMessage error={issue?.message || error} />
            <InventoryItemEditor key={active.key} row={active} editing={editing} issue={issue?.key === active.key ? issue : null} onChange={changeItem} />
            <InventoryDocuments attachments={attachments} files={files} onFilesChange={setFiles}
              onRemoveAttachment={(index) => setAttachments((current) => current.filter((_, position) => position !== index))} />
          </div></fieldset>}
        </div>
        <InventorySelection rows={rows} activeKey={active?.key} reviewing={reviewing} editing={editing} saving={saving}
          value={stockValue} onReview={() => openItem(active?.key)} onSelect={openItem} onRemove={removeItem}
          onQuantity={(key, quantity) => changeItem(key, { quantity })} />
      </div>
      <InventoryMobileSelection count={rows.length} reviewing={reviewing} editing={editing} saving={saving} value={stockValue}
        onReview={() => openItem(active?.key)} />
    </form>
  </div>;
}

export default function InventoryEdit() {
  const { id } = useParams();
  const { canManageStock } = useProcurementAccess();
  const load = useCallback(async () => (await getInventoryById(id)).data.item, [id]);
  const resource = useProcurementResource(load, Boolean(id) && canManageStock);
  if (canManageStock && !resource.loading && !resource.error) {
    return <CatalogWorkspace key={id || 'new'} item={resource.data} />;
  }
  return <div className="proc-page">
    <InventoryPageHeader editing={Boolean(id)} />
    {!canManageStock ? <Empty title="Your role has read-only inventory access" /> :
      resource.loading ? <Pending label="Loading item" /> :
      <ErrorMessage error={resource.error} onRetry={resource.refresh} />}
  </div>;
}
