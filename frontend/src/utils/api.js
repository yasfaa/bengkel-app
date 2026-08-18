/**
 * Central HTTP client helper with standardized error parsing
 */

export async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal mengambil data dari server.');
  }
  return res.json();
}

export async function apiPost(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal menyimpan data ke server.');
  }
  return res.status === 204 ? null : res.json();
}

export async function apiPatch(url, data) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal memperbarui data di server.');
  }
  return res.status === 204 ? null : res.json();
}

export async function apiDelete(url) {
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal menghapus data dari server.');
  }
  return true;
}
