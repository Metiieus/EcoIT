import { useState } from 'react';
import { EcoITApi } from '../services/api';
import { Icon } from '../components/Icon';

export function SettingsView({ counts, macroPillars, demandTypes, onSettingsUpdate }: { counts: { items: number, connections: number }, macroPillars: any[], demandTypes: string[], onSettingsUpdate: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'pillars' | 'demand'>('geral');
  
  // States for forms
  const [dTypes, setDTypes] = useState<string[]>(demandTypes);
  const [newDType, setNewDType] = useState('');
  
  const [pillars, setPillars] = useState<any[]>(macroPillars);
  const [newPillar, setNewPillar] = useState({ id: '', num: '', name: '', short: '', color: '#10B981', icon: 'gov', group: 'gov' });

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await EcoITApi.exportGraph();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecoit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Erro ao exportar backup.');
    } finally {
      setExporting(false);
    }
  };

  const saveDemandTypes = async (types: string[]) => {
    try {
      await EcoITApi.saveSetting('demand_types', JSON.stringify(types));
      setDTypes(types);
      onSettingsUpdate();
    } catch (e) {
      alert('Erro ao salvar tipos de demanda.');
    }
  };

  const addDemandType = () => {
    if (!newDType.trim()) return;
    const nt = [...dTypes, newDType.trim()];
    saveDemandTypes(nt);
    setNewDType('');
  };

  const removeDemandType = (t: string) => {
    const nt = dTypes.filter(x => x !== t);
    saveDemandTypes(nt);
  };

  const addPillar = async () => {
    if (!newPillar.name.trim() || !newPillar.num.trim()) return;
    try {
      const pid = 'p' + Date.now();
      const payload = { ...newPillar, id: pid };
      await EcoITApi.createPillar(payload);
      setPillars([...pillars, payload]);
      setNewPillar({ id: '', num: '', name: '', short: '', color: '#10B981', icon: 'gov', group: 'gov' });
      onSettingsUpdate();
    } catch (e) {
      alert('Erro ao criar pilar.');
    }
  };

  const deletePillar = async (id: string) => {
    if (!window.confirm('Tem certeza? Isso pode afetar os itens atrelados a este pilar.')) return;
    try {
      await EcoITApi.deletePillar(id);
      setPillars(pillars.filter(p => p.id !== id));
      onSettingsUpdate();
    } catch (e) {
      alert('Erro ao deletar pilar.');
    }
  };

  return (
    <div style={{ padding: 40, width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px' }}>Configurações</h1>
        <p style={{ margin: '0 0 30px 0', color: 'var(--text-muted)' }}>Gestão de dados e parâmetros do sistema EcoIT.</p>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-main)', paddingBottom: 16 }}>
          {[
            { id: 'geral', label: 'Geral & Backup' },
            { id: 'pillars', label: 'Pilares Estratégicos' },
            { id: 'demand', label: 'Tipos de Demanda' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ background: activeTab === t.id ? 'var(--bg-surface)' : 'transparent', color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', border: activeTab === t.id ? '1px solid var(--border-main)' : '1px solid transparent', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'geral' && (
          <>
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, margin: '0 0 16px 0', color: 'var(--text-primary)', fontWeight: 800 }}>Visão Geral</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 16, border: '1px solid var(--border-main)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Total de Ativos</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-primary)' }}>{counts.items}</div>
                </div>
                
                <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 16, border: '1px solid var(--border-main)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Total de Conexões</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-primary)' }}>{counts.connections}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', padding: 24 }}>
              <h2 style={{ fontSize: 16, margin: '0 0 8px 0', color: 'var(--text-primary)', fontWeight: 800 }}>Backup do Ecossistema</h2>
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
                Exporte todos os nós, conexões, e metadados estruturais em formato JSON. 
                <strong style={{ color: 'var(--text-primary)' }}>Nota:</strong> As senhas cifradas do Cofre não são exportadas, apenas os metadados (id e ativo).
              </p>
              
              <button 
                onClick={handleExport}
                disabled={exporting}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--accent-primary)', color: 'var(--accent-text)', border: 'none', 
                  padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer',
                  opacity: exporting ? 0.7 : 1
                }}
              >
                <Icon name="ecosystem" size={16} color="#06130b" />
                {exporting ? 'Exportando...' : 'Exportar Backup JSON'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'demand' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', padding: 24 }}>
            <h2 style={{ fontSize: 16, margin: '0 0 16px 0', color: 'var(--text-primary)', fontWeight: 800 }}>Tipos de Demanda</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {dTypes.map(t => (
                <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', padding: '10px 14px', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
                  <button onClick={() => removeDemandType(t)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Remover</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newDType} onChange={e => setNewDType(e.target.value)} placeholder="Novo tipo..." style={{ flex: 1, height: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '0 12px', color: 'var(--text-primary)' }} />
              <button onClick={addDemandType} style={{ background: 'var(--accent-primary)', color: 'var(--accent-text)', border: 'none', borderRadius: 8, padding: '0 16px', fontWeight: 700, cursor: 'pointer' }}>Adicionar</button>
            </div>
          </div>
        )}

        {activeTab === 'pillars' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-main)', padding: 24 }}>
            <h2 style={{ fontSize: 16, margin: '0 0 16px 0', color: 'var(--text-primary)', fontWeight: 800 }}>Pilares Estratégicos</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {pillars.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderLeft: `4px solid ${p.color}`, padding: '12px 14px', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{p.num}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name} <span style={{ opacity: 0.5, fontSize: 12 }}>({p.short})</span></div>
                  </div>
                  <button onClick={() => deletePillar(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Remover</button>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 14, margin: '0 0 12px 0', color: 'var(--text-primary)', fontWeight: 800 }}>Cadastrar Novo Pilar</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input value={newPillar.num} onChange={e => setNewPillar({ ...newPillar, num: e.target.value })} placeholder="Nº (ex: 09)" style={{ height: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '0 12px', color: 'var(--text-primary)' }} />
              <input value={newPillar.name} onChange={e => setNewPillar({ ...newPillar, name: e.target.value })} placeholder="Nome Completo" style={{ height: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '0 12px', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <input value={newPillar.short} onChange={e => setNewPillar({ ...newPillar, short: e.target.value })} placeholder="Nome Curto" style={{ height: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '0 12px', color: 'var(--text-primary)' }} />
              <input type="color" value={newPillar.color} onChange={e => setNewPillar({ ...newPillar, color: e.target.value })} style={{ height: 40, width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '2px 4px', cursor: 'pointer' }} />
              <select value={newPillar.icon} onChange={e => setNewPillar({ ...newPillar, icon: e.target.value })} style={{ height: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '0 12px', color: 'var(--text-primary)' }}>
                <option value="gov">Gov</option>
                <option value="servidor">Servidor</option>
                <option value="firewall">Segurança</option>
                <option value="connections">Rede</option>
                <option value="chart">BI</option>
                <option value="users">Usuários</option>
                <option value="dollar">Financeiro</option>
                <option value="cpu">Inovação/CPU</option>
              </select>
            </div>
            <h3 style={{ fontSize: 11, margin: '0 0 6px 0', color: 'var(--text-secondary)', fontWeight: 700 }}>TEMPLATE DE FORMULÁRIO</h3>
            <select value={newPillar.group} onChange={e => setNewPillar({ ...newPillar, group: e.target.value })} style={{ width: '100%', height: 40, marginBottom: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 8, padding: '0 12px', color: 'var(--text-primary)' }}>
              <option value="infra">Infra / Hardware (Servidores, Nuvem, IP)</option>
              <option value="inventory">Inventário Físico (Notebooks, Mobile, Periféricos)</option>
              <option value="gov">Gestão / ITIL (Demandas, SLAs, Responsáveis)</option>
              <option value="sec">Segurança / Cofre (Senhas, Criticidade, Domínios)</option>
              <option value="biz">FinOps / Negócios (TCO, Projetos, Licenças)</option>
              <option value="agile">Metodologia Ágil (Kanban, Sprints, Tarefas)</option>
              <option value="purchase">Aquisições / Compras (Planeamento, Impactos)</option>
            </select>
            <button onClick={addPillar} style={{ width: '100%', height: 44, background: 'var(--accent-primary)', color: 'var(--accent-text)', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Adicionar Pilar</button>
          </div>
        )}
      </div>
    </div>
  );
}
