import { pillarById, levelMeta } from '../types/data';
import { Icon } from './Icon';

interface ModalProps {
  mode: 'add' | 'edit';
  form: any;
  onClose: () => void;
  onSave: (openVault: boolean) => void;
  onFormChange: (patch: any) => void;
  demandTypes?: string[];
  macroPillars?: any[];
}

const HW_LIST: [string, string][] = [
  ['Roteador', 'roteador'], ['Switch', 'switch'], ['Wi-Fi AP', 'wifi'], 
  ['Servidor', 'servidor'], ['VM', 'vm'], ['Nuvem', 'nuvem']
];

const INV_LIST: [string, string][] = [
  ['Notebook/PC', 'cpu'], ['Periférico', 'mouse'], ['Mobile', 'users']
];

export function NodeModal({ mode, form, demandTypes = [], macroPillars = [], onClose, onSave, onFormChange }: ModalProps) {
  const g = form.pillar ? pillarById(form.pillar)?.group : null;
  const valid = form.name.trim().length > 0 && !!form.pillar;

  const chip = (on: boolean, color: string): React.CSSProperties => ({
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 4px', borderRadius: 11, cursor: 'pointer',
    border: on ? `1.5px solid ${color}` : '1px solid var(--border-main)',
    background: on ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--bg-surface)',
    color: on ? 'var(--text-primary)' : 'var(--text-secondary)'
  });

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--bg-main) 70%, transparent)', backdropFilter: 'blur(2px)' }} onMouseDown={onClose}>
      <div className="modal-content" style={{ width: 620, maxWidth: 'calc(100vw - 40px)', background: 'var(--bg-card)', borderRadius: 20, boxShadow: '0 30px 70px rgba(0,0,0,.28)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 60px)' }} onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-.3px', color: 'var(--text-primary)' }}>{mode === 'edit' ? 'Editar Registo' : (g === 'purchase' || g === 'biz' ? 'Novo Registo Financeiro' : 'Cadastrar Ativo')}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>{mode === 'edit' ? 'Atualize as informações.' : 'Preencha as informações para adicionar ao ecossistema.'}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: '1px solid var(--border-main)', background: 'var(--bg-surface)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><Icon name="x" size={17} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 8px', overflowY: 'auto' }}>
          <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 7 }}>NOME DO ATIVO</label>
          <input value={form.name} onChange={e => onFormChange({ name: e.target.value })} placeholder="Ex: Servidor Principal, Switch Core" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 11, background: 'var(--bg-surface)', padding: '0 14px', fontSize: 14, outline: 'none', marginBottom: 20, color: 'var(--text-primary)' }} />

          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>PILAR ESTRATÉGICO *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {macroPillars.map(pl => {
                const on = form.pillar === pl.id;
                return (
                  <div key={pl.id} onClick={() => onFormChange({ pillar: pl.id })} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: on ? `1.5px solid ${pl.color}` : '1px solid var(--border-main)', background: on ? `color-mix(in srgb, ${pl.color} 15%, transparent)` : 'var(--bg-card)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: on ? pl.color : 'var(--border-main)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{pl.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INFRA fields */}
          {g === 'infra' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>TIPO / CATEGORIA</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {HW_LIST.map(([label, ic]) => {
                  const on = form.hwType === label;
                  return (
                    <div key={label} onClick={() => onFormChange({ hwType: label })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 4px', borderRadius: 10, cursor: 'pointer', border: on ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-main)', background: on ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'var(--bg-card)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>
                      <Icon name={ic} color={on ? 'var(--accent-primary)' : 'var(--text-secondary)'} size={18} />
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>ENDEREÇO IP / HOSTNAME</label>
                  <input value={form.ip} onChange={e => onFormChange({ ip: e.target.value })} placeholder="10.0.0.1" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>STATUS INICIAL</label>
                  <div style={{ display: 'flex', gap: 6, height: 44 }}>
                    {([['online', 'Online'], ['warning', 'Manutenção'], ['offline', 'Offline']] as const).map(([k, label]) => {
                      const color = levelMeta(k).color;
                      const on = form.status === k;
                      return (
                        <div key={k} onClick={() => onFormChange({ status: k })} style={{ ...chip(on, color), borderRadius: 10, padding: '0 8px' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                          <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY fields */}
          {g === 'inventory' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>CATEGORIA</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {INV_LIST.map(([label, ic]) => {
                  const on = form.hwType === label;
                  return (
                    <div key={label} onClick={() => onFormChange({ hwType: label })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 4px', borderRadius: 10, cursor: 'pointer', border: on ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-main)', background: on ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'var(--bg-card)', color: on ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>
                      <Icon name={ic} color={on ? 'var(--accent-primary)' : 'var(--text-secondary)'} size={18} />
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>MODELO DO EQUIPAMENTO</label>
                  <input value={form.modelo} onChange={e => onFormChange({ modelo: e.target.value })} placeholder="Ex: ThinkPad T14" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>NÚMERO DE SÉRIE (S/N)</label>
                  <input value={form.serialNumber} onChange={e => onFormChange({ serialNumber: e.target.value })} placeholder="Ex: PF-34XYZ" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>UTILIZADOR DESIGNADO</label>
                  <input value={form.user} onChange={e => onFormChange({ user: e.target.value })} placeholder="Nome ou E-mail" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>LOCALIZAÇÃO / DEP.</label>
                  <input value={form.loc} onChange={e => onFormChange({ loc: e.target.value })} placeholder="Ex: HQ - 3º Andar" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>ESTADO DO EQUIPAMENTO</label>
              <div style={{ display: 'flex', gap: 6, height: 44 }}>
                {[['Novo', 'Novo'], ['Em Uso', 'Em uso'], ['Manutenção', 'Manutenção'], ['Abatido', 'Abatido']].map(([k, label]) => {
                  const on = form.estadoFisico === k;
                  return (
                    <div key={k} onClick={() => onFormChange({ estadoFisico: k })} style={{ ...chip(on, 'var(--accent-primary)'), borderRadius: 10, padding: '0 8px' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GOV fields */}
          {g === 'gov' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>TIPO DE DEMANDA</label>
                  <select value={form.demandType} onChange={e => onFormChange({ demandType: e.target.value })} style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 10px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }}>
                    {demandTypes.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>RESPONSÁVEL</label>
                  <select value={form.resp} onChange={e => onFormChange({ resp: e.target.value })} style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 10px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }}>
                    {['DPO', 'Gestor', 'L1/L2'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>PRAZO / SLA</label>
                  <input value={form.prazo} onChange={e => onFormChange({ prazo: e.target.value })} placeholder="Ex: 30 dias" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>PRIORIDADE</label>
                  <div style={{ display: 'flex', gap: 6, height: 44 }}>
                    {['Baixa', 'Média', 'Alta', 'Crítica'].map(v => {
                      const color = levelMeta(v).color;
                      return <div key={v} onClick={() => onFormChange({ prioridade: v })} style={{ ...chip(form.prioridade === v, color), borderRadius: 10, padding: '0 4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} /><span style={{ fontSize: 11, fontWeight: 700 }}>{v}</span></div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEC fields */}
          {g === 'sec' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>DOMÍNIO DE SEGURANÇA</label>
                  <select value={form.dominio} onChange={e => onFormChange({ dominio: e.target.value })} style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 10px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }}>
                    {['Identidade / MFA', 'Vulnerabilidades', 'Backup 3-2-1', 'Antiphishing', 'LGPD'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>NÍVEL DE CRITICIDADE</label>
                  <div style={{ display: 'flex', gap: 6, height: 44 }}>
                    {['Baixa', 'Média', 'Alta', 'Crítica'].map(v => {
                      const color = levelMeta(v).color;
                      return <div key={v} onClick={() => onFormChange({ criticidade: v })} style={{ ...chip(form.criticidade === v, color), borderRadius: 10, padding: '0 4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} /><span style={{ fontSize: 11, fontWeight: 700 }}>{v}</span></div>;
                    })}
                  </div>
                </div>
              </div>
              <button onClick={() => onSave(true)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 44, border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)', background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', borderRadius: 10, fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                <Icon name="lock" color="var(--accent-primary)" size={17} />Salvar Ativo e Guardar Senha no Cofre
              </button>
            </div>
          )}

          {/* BIZ fields */}
          {g === 'biz' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>TIPO</label>
                  <select value={form.tipo} onChange={e => onFormChange({ tipo: e.target.value })} style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 10px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }}>
                    {['Dashboard BI', 'ETL / API', 'Contrato SaaS', 'Orçamento TCO', 'IA Operacional', 'Projeto', 'Pesquisa'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>CUSTO ANUAL (TCO)</label>
                  <input value={form.custo} onChange={e => onFormChange({ custo: e.target.value })} placeholder="Ex: R$ 48.000" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>FORNECEDOR / FERRAMENTA</label>
              <input value={form.fornecedor} onChange={e => onFormChange({ fornecedor: e.target.value })} placeholder="Ex: AWS, Power BI" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', marginBottom: 18, color: 'var(--text-primary)' }} />
              
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>PROJETOS RELACIONADOS</label>
              <input value={form.projetos} onChange={e => onFormChange({ projetos: e.target.value })} placeholder="Ex: Migração Cloud, Novo ERP" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', marginBottom: 18, color: 'var(--text-primary)' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>IDEIAS</label>
                  <input value={form.ideias} onChange={e => onFormChange({ ideias: e.target.value })} placeholder="O que inovar?" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>EM ANDAMENTO</label>
                  <input value={form.emAndamento} onChange={e => onFormChange({ emAndamento: e.target.value })} placeholder="Ex: 2 Sprints" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </div>
          )}

          {/* AGILE fields */}
          {g === 'agile' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>FASE DO FLUXO (KANBAN)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
                {[['backlog', 'Backlog', '#6b7280'], ['todo', 'A Fazer', '#3b82f6'], ['inprogress', 'Fazendo', '#8b5cf6'], ['review', 'Revisão', '#f59e0b'], ['done', 'Feito', 'var(--accent-primary)']].map(([k, label, color]) => {
                  const on = form.fase === k;
                  return (
                    <div key={k} onClick={() => onFormChange({ fase: k })} style={{ ...chip(on, color), flexDirection: 'column', gap: 8, padding: '12px 4px', borderRadius: 10, border: on ? `1.5px solid ${color}` : '1px solid var(--border-main)', background: on ? `color-mix(in srgb, ${color} 10%, transparent)` : 'var(--bg-card)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>TIPO DE ITEM</label>
                  <select value={form.tipoItem} onChange={e => onFormChange({ tipoItem: e.target.value })} style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 10px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }}>
                    {['Épico', 'Projeto', 'Sprint', 'Tarefa', 'Bug', 'Melhoria'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>RESPONSÁVEL</label>
                  <input value={form.responsavelAgil} onChange={e => onFormChange({ responsavelAgil: e.target.value })} placeholder="Nome / Squad" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>ESFORÇO / STORY POINTS</label>
                  <input value={form.esforco} onChange={e => onFormChange({ esforco: e.target.value })} placeholder="Ex: 5" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>DATA ALVO (ENTREGA)</label>
                  <input type="date" value={form.dataAlvo} onChange={e => onFormChange({ dataAlvo: e.target.value })} style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', color: 'var(--text-primary)', colorScheme: 'dark' }} />
                </div>
              </div>
            </div>
          )}

          {/* PURCHASE fields */}
          {g === 'purchase' && (
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>STATUS DA COMPRA</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
                {[['Planeamento', 'Planear', '#6b7280'], ['Cotação', 'Cotação', '#3b82f6'], ['Aprovação', 'Aprovar', '#f59e0b'], ['Aprovado', 'Aprovado', '#8b5cf6'], ['Comprado', 'Comprado', 'var(--accent-primary)']].map(([k, label, color]) => {
                  const on = form.statusCompra === k;
                  return (
                    <div key={k} onClick={() => onFormChange({ statusCompra: k })} style={{ ...chip(on, color), flexDirection: 'column', gap: 8, padding: '12px 4px', borderRadius: 10, border: on ? `1.5px solid ${color}` : '1px solid var(--border-main)', background: on ? `color-mix(in srgb, ${color} 10%, transparent)` : 'var(--bg-card)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>FORNECEDOR (SE HOUVER)</label>
                  <input value={form.fornecedor} onChange={e => onFormChange({ fornecedor: e.target.value })} placeholder="Ex: Dell, AWS" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>CUSTO ESTIMADO / FINAL</label>
                  <input value={form.custo} onChange={e => onFormChange({ custo: e.target.value })} placeholder="Ex: R$ 3.500" style={{ width: '100%', height: 44, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '0 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>IMPACTO POSITIVO (JUSTIFICATIVA)</label>
              <textarea value={form.impactoPositivo} onChange={e => onFormChange({ impactoPositivo: e.target.value })} placeholder="O que ganhamos com isso?" style={{ width: '100%', height: 50, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '10px 14px', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', color: 'var(--text-primary)', marginBottom: 18 }} />
              
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>RISCO (SE NÃO COMPRARMOS)</label>
              <textarea value={form.impactoNegativo} onChange={e => onFormChange({ impactoNegativo: e.target.value })} placeholder="Qual o impacto de não ter?" style={{ width: '100%', height: 50, border: '1px solid var(--border-main)', borderRadius: 10, background: 'var(--bg-card)', padding: '10px 14px', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }} />
            </div>
          )}

          {/* Generic Description for all groups */}
          <div style={{ borderTop: '1px dashed var(--border-main)', paddingTop: 18, marginTop: 18 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 7 }}>DESCRIÇÃO ADICIONAL</label>
            <textarea value={form.descricao || ''} onChange={e => onFormChange({ descricao: e.target.value })} placeholder="Informações extras ou observações sobre este ativo" style={{ width: '100%', height: 70, border: '1px solid var(--border-main)', borderRadius: 11, background: 'var(--bg-surface)', padding: '10px 14px', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '18px 24px', borderTop: '1px solid var(--border-main)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 42, padding: '0 18px', border: '1px solid var(--border-main)', background: 'var(--bg-surface)', borderRadius: 11, fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => onSave(false)} style={{ height: 42, padding: '0 20px', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 13.5, color: '#fff', cursor: valid ? 'pointer' : 'not-allowed', background: valid ? 'var(--accent-primary)' : 'var(--border-main)', boxShadow: valid ? '0 4px 12px color-mix(in srgb, var(--accent-primary) 35%, transparent)' : 'none' }}>
            {mode === 'edit' ? 'Salvar Alterações' : 'Adicionar ao Canvas'}
          </button>
        </div>
      </div>
    </div>
  );
}
