/**
 * Frontend display formatters
 */

export const formatCurrency = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  if (status === 'Menunggu') return 'badge-pending';
  if (status === 'Dikerjakan') return 'badge-working';
  if (status === 'Selesai') return 'badge-done';
  return '';
};

export const buildMotorLabel = (brandName, typeName, capacityName) => {
  const parts = [brandName, typeName].filter(Boolean);
  const base = parts.join(' ');
  return capacityName ? `${base} (${capacityName})` : base;
};
