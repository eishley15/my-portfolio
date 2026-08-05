const KEY = "studio_token";

export function getStudioToken() {
  return sessionStorage.getItem(KEY);
}

export function setStudioToken(token) {
  sessionStorage.setItem(KEY, token);
}

export function clearStudioToken() {
  sessionStorage.removeItem(KEY);
}

export function isStudioLoggedIn() {
  const token = getStudioToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function studioAuthHeaders() {
  const token = getStudioToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function studioLogin(password) {
  const res = await fetch("/api/studio-auth", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ password }),
  });
  if (res.status === 429) throw new Error("Too many attempts. Please wait before trying again.");
  if (!res.ok)            throw new Error("Invalid credentials");
  const { token } = await res.json();
  setStudioToken(token);
  return token;
}
