export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await getError(res));
  return res.json();
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getError(res));
  return res.json();
}

export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getError(res));
  return res.json();
}

export async function apiDelete<T>(url: string): Promise<T | void> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(await getError(res));
  if (res.status === 204) return;
  return res.json();
}

async function getError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

export type ParentResult = {
  parent?: { id: number; username: string };
  otherParent?: { id: number; username: string };
};

export async function getParentsNames(childId: number) {
  const result = await apiGet(`/api/children/${childId}/parent`) as ParentResult;
  if (result.otherParent) {
    return `${result.parent?.username} & ${result.otherParent.username}`;
  } else if (result.parent) {
    return `${result.parent.username}`;
  } else {
    return "";
  }
}
