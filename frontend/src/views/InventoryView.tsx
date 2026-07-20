import { useState } from 'react';
import { type EcoNode, PILLARS, itemStatus } from '../types/data';
import { Icon } from '../components/Icon';

interface InventoryViewProps {
  nodes: EcoNode[];
  onEditNode: (id: string) => void;
  onAddNode: () => void;
  onDeleteNode: (id: string) => void;
}

export function InventoryView({ nodes, onEditNode, onAddNode, onDeleteNode }: InventoryViewProps) {
  const [search, setSearch] = useState('');
  
  const items = nodes.filter(n => n.kind === 'item' && n.group === 'inventory' && (n.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: 40, width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px' }}>Inventário Físico</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gestão de equipamentos (Notebooks, Periféricos, Mobile).</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--border-main)' }}>
              <Icon name="search" size={16} color="var(--text-muted)" />
              <input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar equipamentos..."
                style={{ border: 'none', outline: 'none', marginLeft: 8, width: 200, fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
              />
            </div>
            <button onClick={onAddNode} style={{ background: 'var(--accent-primary)', color: 'var(--accent-text)', border: 'none', borderRadius: 8, padding: '0 16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="settings" size={16} /></span>
              Adicionar Equipamento
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-main)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Equipamento</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Modelo</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>S/N</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Estado</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Utilizador</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum equipamento registado neste módulo.</td></tr>
              ) : items.map(item => {
                const status = itemStatus(item);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.hwType || 'Outro'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>{item.modelo || '-'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{item.serialNumber || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${status.color}15`, color: status.color, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>{item.user || '-'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => onEditNode(item.id)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-main)', cursor: 'pointer', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 6, marginRight: 8, fontSize: 12, fontWeight: 700 }}>
                        Editar
                      </button>
                      <button onClick={() => { if(confirm('Excluir este equipamento?')) onDeleteNode(item.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }} title="Excluir">
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
