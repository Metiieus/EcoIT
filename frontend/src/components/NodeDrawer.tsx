import React, { useState, useEffect, useRef } from 'react';
import { PILLARS, pillarById, itemStatus, levelMeta, type EcoNode, type EcoEdge } from '../types/data';
import { Icon } from './Icon';
import { EcoITApi } from '../services/api';

interface DrawerProps {
  node: EcoNode;
  nodes?: EcoNode[]; // For pillar items list
  edges: EcoEdge[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateNode: (patch: Partial<EcoNode>) => void;
  onOpenAdd?: () => void;
}

export function NodeDrawer({ node, nodes = [], edges, onClose, onEdit, onDelete, onUpdateNode, onOpenAdd }: DrawerProps) {
  const [tab, setTab] = useState<'details' | 'vault' | 'wiki'>('details');
  const [showPass, setShowPass] = useState(false);
  const [secrets, setSecrets] = useState<any[]>([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  
  // Vault Form
  const [formUser, setFormUser] = useState(node.user || '');
  const [formPass, setFormPass] = useState(node.pass || '');
  const [savingSecret, setSavingSecret] = useState(false);

  // Reveal State
  const [revealed, setRevealed] = useState<{ id: string, pass: string, left: number } | null>(null);
  const timerRef = useRef<any>(null);

  // Notes state
  const [notes, setNotes] = useState(node.notes || '');
  const [notesSaving, setNotesSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const notesTimeout = useRef<any>(null);

  const pl = node.kind === 'pillar' ? PILLARS.find(p => p.id === node.id) : pillarById(node.pillar || '');
  const stt = node.kind === 'item' ? itemStatus(node) : { color: pl?.color || '#ccc', label: 'Pilar Base' };

  // Clear revealed on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update notes if node changes externally
  useEffect(() => {
    setNotes(node.notes || '');
  }, [node.id, node.notes]);

  const loadSecrets = async () => {
    setLoadingSecrets(true);
    try {
      const data = await EcoITApi.listSecrets(node.id);
      setSecrets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSecrets(false);
    }
  };

  useEffect(() => {
    if (tab === 'vault') {
      loadSecrets();
      setFormUser('');
      setFormPass('');
      hideSecret();
    }
  }, [tab, node.id]);

  const handleSaveSecret = async () => {
    if (!formPass) return;
    setSavingSecret(true);
    try {
      await EcoITApi.saveSecret(node.id, formUser, formPass);
      setFormUser('');
      setFormPass('');
      loadSecrets();
      // Update vault count in parent state implicitly or explicitly. 
      // For now, next full reload will pick it up.
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar segredo no cofre.');
    } finally {
      setSavingSecret(false);
    }
  };

  const hideSecret = () => {
    setRevealed(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReveal = async (id: string) => {
    hideSecret();
    try {
      const pass = await EcoITApi.revealSecret(id);
      setRevealed({ id, pass, left: 30 });
      timerRef.current = setInterval(() => {
        setRevealed(prev => {
          if (!prev) return null;
          if (prev.left <= 1) {
            clearInterval(timerRef.current);
            return null;
          }
          return { ...prev, left: prev.left - 1 };
        });
      }, 1000);
    } catch (e) {
      console.error(e);
      alert('Erro ao revelar segredo.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Wiki Auto-save
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setNotesSaving('saving');
    
    if (notesTimeout.current) clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(async () => {
      try {
        await EcoITApi.updateNode(node.id, { notes: val });
        onUpdateNode({ notes: val });
        setNotesSaving('saved');
        setTimeout(() => setNotesSaving('idle'), 2000);
      } catch (err) {
        console.error(err);
        setNotesSaving('idle');
      }
    }, 1000);
  };

  if (!pl) return null;

  const tabStyle = (on: boolean): React.CSSProperties => ({
    padding: '9px 0', marginBottom: -1, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
    color: on ? 'var(--accent-primary)' : 'var(--text-muted)',
    borderBottom: on ? '2px solid var(--accent-primary)' : '2px solid transparent'
  });

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, textAlign: 'right', color: 'var(--text-primary)' };
  const txt: React.CSSProperties = { fontWeight: 700, fontSize: 13, textAlign: 'right', color: 'var(--text-primary)' };

  const fields: { label: string; value: string; style: React.CSSProperties }[] = [
    { label: 'Pilar', value: `${pl.num} · ${pl.short}`, style: txt }
  ];
  if (node.group === 'infra') {
    fields.push({ label: 'Hardware / Nuvem', value: node.hwType || '—', style: txt });
    fields.push({ label: 'IP / Hostname', value: node.ip || '—', style: mono });
    fields.push({ label: 'Status', value: stt.label, style: { ...txt, color: stt.color } });
  } else if (node.group === 'gov') {
    fields.push({ label: 'Tipo de Demanda', value: node.demandType || '—', style: txt });
    fields.push({ label: 'Responsável', value: node.resp || '—', style: txt });
    fields.push({ label: 'Prazo / SLA', value: node.prazo || '—', style: mono });
    fields.push({ label: 'Prioridade', value: node.prioridade || '—', style: { ...txt, color: levelMeta(node.prioridade || 'Média').color } });
  } else if (node.group === 'sec') {
    fields.push({ label: 'Domínio', value: node.dominio || '—', style: txt });
    fields.push({ label: 'Criticidade', value: node.criticidade || '—', style: { ...txt, color: levelMeta(node.criticidade || 'Média').color } });
  } else if (node.group === 'biz') {
    fields.push({ label: 'Tipo', value: node.tipo || '—', style: txt });
    fields.push({ label: 'Fornecedor', value: node.fornecedor || '—', style: txt });
    fields.push({ label: 'Custo Anual (TCO)', value: node.custo || '—', style: mono });
  } else if (node.group === 'agile') {
    fields.push({ label: 'Tipo de Item', value: node.tipoItem || '—', style: txt });
    fields.push({ label: 'Responsável', value: node.responsavelAgil || '—', style: txt });
    fields.push({ label: 'Story Points', value: node.esforco || '—', style: mono });
    fields.push({ label: 'Data Alvo', value: node.dataAlvo || '—', style: mono });
    fields.push({ label: 'Fase (Kanban)', value: stt.label, style: { ...txt, color: stt.color } });
  } else if (node.group === 'purchase') {
    fields.push({ label: 'Fornecedor', value: node.fornecedor || '—', style: txt });
    fields.push({ label: 'Custo Estimado', value: node.custo || '—', style: mono });
    if (node.impactoPositivo) fields.push({ label: 'Impacto Positivo', value: node.impactoPositivo, style: { ...txt, textAlign: 'left', fontWeight: 500, color: 'var(--accent-primary)' } });
    if (node.impactoNegativo) fields.push({ label: 'Risco', value: node.impactoNegativo, style: { ...txt, textAlign: 'left', fontWeight: 500, color: 'var(--color-error)' } });
    fields.push({ label: 'Status Compra', value: stt.label, style: { ...txt, color: stt.color } });
  }

  if (node.descricao) {
    fields.push({ label: 'Descrição', value: node.descricao, style: { ...txt, textAlign: 'left', color: '#5B6560', fontWeight: 400, marginTop: 4 } });
  }

  const connCount = edges.filter(e => e.source === node.id || e.target === node.id).length;
  fields.push({ label: 'Conexões', value: String(connCount), style: mono });

  if (node.kind === 'pillar' && pl) {
    const pItems = nodes.filter(n => n.kind === 'item' && n.pillar === pl.id);
    return (
      <aside className="drawer-content" style={{ width: 372, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
        <div style={{ padding: '24px 22px 20px', borderBottom: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: pl.color }}>
                <Icon name={pl.icon} size={20} />
                <span style={{ fontSize: 11, letterSpacing: '.1em', fontWeight: 800 }}>PILAR {pl.num}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-.3px', marginTop: 8, color: 'var(--text-primary)' }}>{pl.name}</div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, border: '1px solid var(--border-main)', background: 'var(--bg-card)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} /></button>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Este pilar estratégico concentra {pItems.length} {pItems.length === 1 ? 'ativo' : 'ativos'} no ecossistema atual.
          </div>
          <button onClick={onOpenAdd} style={{ marginTop: 20, width: '100%', height: 42, background: 'var(--accent-primary)', color: 'var(--accent-text)', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="plus" size={16} /> Cadastrar Novo Ativo
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: 14 }}>ATIVOS ({pItems.length})</div>
          {pItems.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>Sem ativos neste pilar.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pItems.map(it => {
                const itemStt = itemStatus(it);
                return (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: itemStt.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.tipo || it.hwType || it.demandType || '—'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="drawer-content" style={{ width: 372, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'inline-block', fontSize: 9.5, letterSpacing: '.1em', fontWeight: 800, color: pl.color, background: 'transparent', border: '1px solid ' + pl.color + '40', borderRadius: 20, padding: '3px 9px' }}>{pl.short.toUpperCase()}</span>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-.3px', marginTop: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250, color: 'var(--text-primary)' }}>{node.name}</div>
          </div>
          <button onClick={() => { hideSecret(); onClose(); }} style={{ width: 32, height: 32, border: '1px solid var(--border-main)', background: 'var(--bg-card)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} /></button>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 11, background: stt.color + '20', borderRadius: 20, padding: '4px 11px', border: '1px solid ' + stt.color + '40' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: stt.color }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: stt.color }}>{stt.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 18, borderBottom: '1px solid var(--border-main)' }}>
          <div style={tabStyle(tab === 'details')} onClick={() => setTab('details')}>Detalhes &amp; Metadados</div>
          <div style={tabStyle(tab === 'vault')} onClick={() => setTab('vault')}>Cofre ({node.vaultCount || 0})</div>
          <div style={tabStyle(tab === 'wiki')} onClick={() => setTab('wiki')}>Wiki &amp; Checkup</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
        {tab === 'details' && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: 14 }}>METADADOS DO ITEM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: f.label === 'Descrição' ? 'flex-start' : 'center', gap: 12, flexDirection: f.label === 'Descrição' ? 'column' : 'row', padding: '9px 13px', borderRadius: 10, background: 'var(--bg-card)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, flexShrink: 0 }}>{f.label}</span>
                  <span style={f.style}>{f.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              <button onClick={onEdit} style={{ flex: 1, height: 42, border: '1px solid var(--border-main)', background: 'var(--bg-card)', borderRadius: 11, fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon name="edit" size={16} />Editar</button>
              <button onClick={onDelete} style={{ flex: 1, height: 42, border: '1px solid #7f1d1d', background: '#450a0a', borderRadius: 11, fontWeight: 700, fontSize: 13.5, color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon name="trash" color="#f87171" size={16} />Excluir</button>
            </div>
          </div>
        )}

        {tab === 'vault' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 11, padding: '11px 13px', marginBottom: 20 }}>
              <Icon name="lock" color="var(--accent-primary)" size={17} />
              <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>Cofre criptografado <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>AES-256-GCM</span>.</span>
            </div>
            
            {/* Adicionar novo */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '.1em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: 7 }}>ADICIONAR CREDENCIAL</label>
              <input value={formUser} onChange={e => setFormUser(e.target.value)} placeholder="Usuário / Identificador" style={{ width: '100%', height: 42, border: '1px solid var(--border-main)', borderRadius: 11, background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '0 13px', fontSize: 13, outline: 'none', marginBottom: 10 }} />
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input value={formPass} onChange={e => setFormPass(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Senha / Token" style={{ width: '100%', height: 42, border: '1px solid var(--border-main)', borderRadius: 11, background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '0 44px 0 13px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', letterSpacing: showPass ? 'normal' : '.08em' }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, border: 'none', background: 'transparent', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><Icon name={showPass ? 'eyeoff' : 'eye'} color="var(--text-muted)" size={17} /></button>
              </div>
              <button disabled={!formPass || savingSecret} onClick={handleSaveSecret} style={{ width: '100%', height: 40, border: 'none', background: formPass && !savingSecret ? 'var(--accent-primary)' : 'var(--border-main)', color: formPass && !savingSecret ? 'var(--accent-text)' : 'var(--text-muted)', borderRadius: 10, fontWeight: 700, cursor: formPass && !savingSecret ? 'pointer' : 'not-allowed' }}>{savingSecret ? 'A Guardar...' : 'Salvar no Cofre'}</button>
            </div>

            {/* Lista */}
            <div style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: 10 }}>SEGREDOS SALVOS</div>
            {loadingSecrets ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>A carregar...</div> : secrets.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum segredo salvo neste nó.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {secrets.map(s => {
                  return (
                    <div key={s.id} style={{ border: '1px solid var(--border-main)', borderRadius: 12, padding: 12, background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{s.usernameOrToken || 'Sem usuário'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {revealed?.id === s.id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input readOnly value={revealed?.pass || ''} style={{ flex: 1, height: 36, border: '1px solid var(--accent-primary)', background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)', color: 'var(--accent-primary)', borderRadius: 8, padding: '0 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none' }} />
                          <button onClick={() => copyToClipboard(revealed?.pass || '')} style={{ width: 36, height: 36, border: '1px solid var(--border-main)', background: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Copiar"><Icon name="secrets" size={16} /></button>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>{revealed?.left || 0}s</div>
                        </div>
                      ) : (
                        <button onClick={() => handleReveal(s.id)} style={{ width: '100%', height: 36, border: '1px solid var(--border-main)', background: 'var(--bg-surface)', borderRadius: 8, fontWeight: 700, fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Icon name="eye" size={15} /> Revelar Senha
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'wiki' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <span style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--text-muted)', fontWeight: 800 }}>WIKI & CHECKUP (MARKDOWN)</span>
              {notesSaving === 'saving' && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>A guardar...</span>}
              {notesSaving === 'saved' && <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 700 }}>Guardado!</span>}
            </div>
            <textarea value={notes} onChange={handleNotesChange} placeholder={'## Procedimentos\n- Regras de firewall\n- Cláusulas do contrato\n- Checklist de checkup mensal'} style={{ width: '100%', minHeight: 320, flex: 1, border: '1px solid var(--border-main)', borderRadius: 12, background: 'var(--bg-card)', color: 'var(--text-primary)', padding: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6, outline: 'none' }} />
          </div>
        )}
      </div>
    </aside>
  );
}
