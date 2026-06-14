// Auth is now session-based via Replit Auth (cookies).
// No token needed — credentials are sent automatically via cookie.
export async function getAuthToken(): Promise<string | null> {
  return null;
}
