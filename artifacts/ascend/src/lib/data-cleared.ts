const KEY = 'ascend-data-cleared';

export function isDataCleared(): boolean {
  try { return localStorage.getItem(KEY) !== null; } catch { return false; }
}

export function setDataCleared(): void {
  try { localStorage.setItem(KEY, String(Date.now())); } catch {}
}
