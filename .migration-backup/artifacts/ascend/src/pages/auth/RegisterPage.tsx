export function RegisterPage() {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || ''}/api/login`;
  return null;
}
