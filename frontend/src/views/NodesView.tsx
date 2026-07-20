import { useState } from 'react';
import { type EcoNode, PILLARS, itemStatus } from '../types/data';
import { Icon } from '../components/Icon';

interface NodesViewProps {
  nodes: EcoNode[];
  onEditNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
}

export function NodesView({ nodes, onEditNode, onDeleteNode }: NodesViewProps) {
  const [search, setSearch] = useState('');
  
  const items = nodes.filter(n => n.kind === 'item' && (n.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: 40, width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px' }}>Ativos e Sistemas</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gestão centralizada de todos os ativos do ecossistema.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--border-main)' }}>
            <Icon name="search" size={16} color="var(--text-muted)" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ativos..."
              style={{ border: 'none', outline: 'none', marginLeft: 8, width: 200, fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-main)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Nome</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Pilar</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Grupo</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum ativo encontrado.</td></tr>
              ) : items.map(item => {
                const p = PILLARS.find(p => p.id === item.pillar);

                const status = itemStatus(item);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${status.color}15`, color: status.color, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{p?.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{item.group}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => onEditNode(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, marginRight: 8 }} title="Editar">
                        <Icon name="edit" size={16} />
                      </button>
                      <button onClick={() => { if(confirm('Excluir este ativo?')) onDeleteNode(item.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }} title="Excluir">
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
