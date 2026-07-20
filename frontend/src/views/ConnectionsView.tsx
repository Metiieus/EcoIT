import { useState } from 'react';
import { type EcoNode, type EcoEdge } from '../types/data';
import { Icon } from '../components/Icon';

interface ConnectionsViewProps {
  nodes: EcoNode[];
  edges: EcoEdge[];
  onDeleteEdge: (id: string) => void;
}

export function ConnectionsView({ nodes, edges, onDeleteEdge }: ConnectionsViewProps) {
  const [search, setSearch] = useState('');
  
  const manualEdges = edges.filter(e => e.kind !== 'spine' && e.kind !== 'auto');
  
  const filteredEdges = manualEdges.filter(e => {
    const source = nodes.find(n => n.id === e.source);
    const target = nodes.find(n => n.id === e.target);
    const term = search.toLowerCase();
    return (source?.name || '').toLowerCase().includes(term) || (target?.name || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ padding: 40, width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px' }}>Conexões</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gestão de dependências e integrações entre ativos.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--border-main)' }}>
            <Icon name="search" size={16} color="var(--text-muted)" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conexões..."
              style={{ border: 'none', outline: 'none', marginLeft: 8, width: 200, fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-main)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Origem</th>
                <th style={{ padding: '14px 16px', width: 40 }}></th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Destino</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEdges.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma conexão encontrada.</td></tr>
              ) : filteredEdges.map(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                return (
                  <tr key={edge.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{source?.name || 'Desconhecido'}</td>
                    <td style={{ padding: '14px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <Icon name="connections" size={16} />
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{target?.name || 'Desconhecido'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => { if(confirm('Remover esta conexão?')) onDeleteEdge(edge.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }} title="Excluir">
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
