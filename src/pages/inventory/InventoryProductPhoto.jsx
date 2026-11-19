import { useState } from 'react';
import { Package } from 'lucide-react';
import { inventoryAttachmentUrl } from '../../services/inventoryService.js';

function ProductImage({ source, priority }) {
  const [failed, setFailed] = useState(false);
  if (!source || failed) return <Package className="inventory-photo__fallback" aria-hidden="true" />;
  return <img src={source} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}

export default function InventoryProductPhoto({ value, priority = false, className = '' }) {
  const source = inventoryAttachmentUrl(value);
  const catalogPhoto = typeof value === 'string' && value.startsWith('/inventory-catalog/');
  return <div aria-hidden="true" className={'inventory-photo' + (catalogPhoto ? ' inventory-photo--studio' : '') + ' ' + className}>
    <ProductImage key={source} source={source} priority={priority} />
  </div>;
}
