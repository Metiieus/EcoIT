const API_BASE = 'http://localhost:3333/api';

export const EcoITApi = {
  // Carrega toda a topologia ao iniciar a aplicação
  fetchGraph: async () => {
    const res = await fetch(`${API_BASE}/ecosystem/graph`);
    return res.json();
  },
  
  // Cria um novo item no ecossistema e vincula-o ao pilar estratégico
  createNode: async (payload: {
    name: string;
    pillarId: string;
    group: string;
    metadata: Record<string, any>;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Disparado no evento onUp após arrastar um cartão no canvas
  updatePosition: async (id: string, positionX: number, positionY: number) => {
    await fetch(`${API_BASE}/nodes/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionX, positionY })
    });
  },

  // Atualização de metadados ou texto Markdown da Wiki
  updateNode: async (id: string, payload: Record<string, any>) => {
    const res = await fetch(`${API_BASE}/nodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Gravação de segredo com cifragem do lado do servidor
  saveSecret: async (nodeId: string, usernameOrToken: string, plainPassword: string) => {
    const res = await fetch(`${API_BASE}/vault/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, usernameOrToken, plainPassword })
    });
    return res.json();
  },

  // Revelação de palavra-passe em tempo real para a UI
  revealSecret: async (vaultId: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/vault/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultId })
    });
    const data = await res.json();
    return data.plainPassword;
  },

  // Eliminação de nó e das respetivas dependências em cascata
  deleteNode: async (id: string) => {
    await fetch(`${API_BASE}/nodes/${id}`, { method: 'DELETE' });
  },

  // Conexões manuais
  createEdge: async (sourceId: string, targetId: string, kind: string = 'manual') => {
    const res = await fetch(`${API_BASE}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, targetId, kind })
    });
    return res.json();
  },

  deleteEdge: async (id: string) => {
    await fetch(`${API_BASE}/edges/${id}`, { method: 'DELETE' });
  }
};
