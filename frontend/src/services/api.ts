const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = 'Erro ao processar requisição';
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch (e) {}
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const EcoITApi = {
  fetchGraph: () => fetchJson<any>(`${API_BASE}/ecosystem/graph`),
  
  createNode: (payload: { name: string; pillarId: string; group: string; metadata: Record<string, any>; notes?: string }) => 
    fetchJson<any>(`${API_BASE}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  updatePosition: (id: string, positionX: number, positionY: number) => 
    fetchJson<void>(`${API_BASE}/nodes/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionX, positionY })
    }),

  updateNode: (id: string, payload: Record<string, any>) => 
    fetchJson<any>(`${API_BASE}/nodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  deleteNode: (id: string) => 
    fetchJson<void>(`${API_BASE}/nodes/${id}`, { method: 'DELETE' }),

  createEdge: (sourceId: string, targetId: string, kind: string = 'manual') => 
    fetchJson<any>(`${API_BASE}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, targetId, kind })
    }),

  deleteEdge: (id: string) => 
    fetchJson<void>(`${API_BASE}/edges/${id}`, { method: 'DELETE' }),

  listSecrets: (nodeId: string) => 
    fetchJson<any[]>(`${API_BASE}/vault/node/${nodeId}`),

  saveSecret: (nodeId: string, usernameOrToken: string, plainPassword: string) => 
    fetchJson<any>(`${API_BASE}/vault/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, usernameOrToken, plainPassword })
    }),

  revealSecret: async (vaultId: string): Promise<string> => {
    const data = await fetchJson<{ plainPassword: string }>(`${API_BASE}/vault/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultId })
    });
    return data.plainPassword;
  },

  listAllSecrets: () => 
    fetchJson<any[]>(`${API_BASE}/vault/all`),

  exportGraph: () => 
    fetchJson<any>(`${API_BASE}/ecosystem/export`)
};
