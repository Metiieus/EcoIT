import { useMemo, useState } from 'react';
import { type EcoNode, itemStatus } from '../types/data';
import { Icon } from '../components/Icon';

interface FinOpsViewProps {
  nodes: EcoNode[];
  onEditNode: (id: string) => void;
  onAddNode: () => void;
}

export function FinOpsView({ nodes, onEditNode, onAddNode }: FinOpsViewProps) {
  const [filter, setFilter] = useState<'all' | 'purchase' | 'contracts'>('all');
  
  const finOpsNodes = useMemo(() => {
    return nodes.filter(n => n.kind === 'item' && (n.group === 'purchase' || n.group === 'biz' || n.custo));
  }, [nodes]);

  const parseCost = (costStr?: string) => {
    if (!costStr) return 0;
    // Extract numbers, commas and dots
    const cleaned = costStr.replace(/[^\d.,]/g, '');
    if (!cleaned) return 0;
    // Normalize format to proper float
    const normalized = cleaned.replace(/\.(?=.*\.)/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const { total, purchases, contracts } = useMemo(() => {
    let t = 0;
    let p = 0;
    let c = 0;
    finOpsNodes.forEach(n => {
      const val = parseCost(n.custo);
      t += val;
      if (n.group === 'purchase') p += val;
      else c += val;
    });
    return { total: t, purchases: p, contracts: c };
  }, [finOpsNodes]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredNodes = finOpsNodes.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'purchase') return n.group === 'purchase';
    return n.group !== 'purchase';
  });

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-.5px', color: 'var(--text-primary)' }}>FinOps &amp; Aquisições</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Visão financeira centralizada para contratos, licenças e novas compras de TI.</p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, background: 'var(--bg-surface)', padding: 6, borderRadius: 12, border: '1px solid var(--border-main)' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: filter === 'all' ? 'var(--accent-primary)' : 'transparent', color: filter === 'all' ? 'var(--accent-text)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Geral</button>
            <button onClick={() => setFilter('contracts')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: filter === 'contracts' ? 'var(--accent-primary)' : 'transparent', color: filter === 'contracts' ? 'var(--accent-text)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Contratos (TCO)</button>
            <button onClick={() => setFilter('purchase')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: filter === 'purchase' ? 'var(--accent-primary)' : 'transparent', color: filter === 'purchase' ? 'var(--accent-text)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Aquisições Pendentes</button>
          </div>
          <button onClick={onAddNode} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', height: 44, borderRadius: 12, border: 'none', background: 'var(--text-primary)', color: 'var(--bg-main)', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Icon name="plus" size={16} /> Novo Registo
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', marginBottom: 12 }}>
            <Icon name="dollar" size={16} /> CUSTO TOTAL (TCO + COMPRAS)
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(total)}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0EA5E9', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', marginBottom: 12 }}>
            <Icon name="connections" size={16} /> RECORRENTES (CONTRATOS)
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(contracts)}</div>
        </div>
        <div style={{ background: 'color-mix(in srgb, var(--accent-primary) 5%, var(--bg-card))', padding: 24, borderRadius: 16, border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-primary)', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', marginBottom: 12 }}>
            <Icon name="plus" size={16} /> ORÇAMENTO DE AQUISIÇÕES
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(purchases)}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-main)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-main)' }}>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--text-muted)' }}>TÍTULO / ATIVO</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--text-muted)' }}>TIPO</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--text-muted)' }}>CUSTO</th>
              <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--text-muted)' }}>STATUS / IMPACTO</th>
              <th style={{ padding: '16px 20px', width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredNodes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum registo financeiro encontrado para este filtro.
                </td>
              </tr>
            )}
            {filteredNodes.map(n => {
              const stt = itemStatus(n);
              return (
                <tr key={n.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.name}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '4px 10px', background: 'var(--bg-main)', borderRadius: 20, color: 'var(--text-secondary)' }}>
                      {n.group === 'purchase' ? 'Aquisição' : n.tipo || 'Ativo'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(parseCost(n.custo))}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {n.group === 'purchase' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stt.color }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: stt.color }}>{stt.label}</span>
                        </div>
                        {n.impactoNegativo && (
                          <div style={{ fontSize: 11, color: 'var(--color-error)' }}>Risco: {n.impactoNegativo}</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Contrato / Recorrente</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button onClick={() => onEditNode(n.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Icon name="edit" size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
