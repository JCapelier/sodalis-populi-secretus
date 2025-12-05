function resolveUrl(path: string): string {
  const isServer = typeof window === "undefined";

  const base = isServer
    ? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    : "";

  return base + path;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = resolveUrl(path);

  const res = await fetch(url);
  if (!res.ok) throw new Error(await getError(res));
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const url = resolveUrl(path);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getError(res));
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const url = resolveUrl(path);

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getError(res));
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T | void> {
  const url = resolveUrl(path);

  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await getError(res));
  if (res.status === 204) return;
  return res.json() as Promise<T>;
}

async function getError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error || res.statusText;
  } catch {
    return res.statusText;
  }
}
