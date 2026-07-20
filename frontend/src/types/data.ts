// 8 Pilares Fixos — espelho exato do front-end original
export let PILLARS = [
  { id: 'p1', num: '01', name: 'Governança e Gestão de Ativos', short: 'Governança', color: '#6366F1', icon: 'gov', group: 'gov' },
  { id: 'p2', num: '02', name: 'Infraestrutura e Nuvem', short: 'Infra & Nuvem', color: '#10B981', icon: 'servidor', group: 'infra' },
  { id: 'p3', num: '03', name: 'Segurança e Compliance', short: 'Segurança', color: '#DC4A3D', icon: 'firewall', group: 'sec' },
  { id: 'p4', num: '04', name: 'Serviços e Processos (ITIL)', short: 'Serviços ITIL', color: '#0EA5E9', icon: 'connections', group: 'gov' },
  { id: 'p5', num: '05', name: 'Dados e Inteligência (BI)', short: 'Dados & BI', color: '#8B5CF6', icon: 'chart', group: 'biz' },
  { id: 'p6', num: '06', name: 'Pessoas e Capacitação', short: 'Pessoas', color: '#E0952B', icon: 'users', group: 'gov' },
  { id: 'p7', num: '07', name: 'Financeiro e Fornecedores (FinOps)', short: 'FinOps', color: '#0D9488', icon: 'dollar', group: 'biz' },
  { id: 'p8', num: '08', name: 'Inovação, IA e BPO', short: 'Inovação & IA', color: '#EC4899', icon: 'cpu', group: 'biz' }
];

export const updatePillars = (newPillars: any[]) => {
  PILLARS = newPillars;
};

export function pillarById(id: string) {
  return PILLARS.find(p => p.id === id);
}

export type GroupType = 'infra' | 'gov' | 'sec' | 'biz' | 'agile' | 'purchase' | 'inventory';

export interface EcoNode {
  id: string;
  kind: 'core' | 'pillar' | 'item';
  x: number; y: number; w: number; h: number;
  name?: string;
  pillar?: string;
  group?: GroupType;
  // Infra
  hwType?: string; ip?: string; status?: string;
  // Inventory (Equipamentos Físicos)
  modelo?: string; serialNumber?: string; loc?: string; estadoFisico?: string;
  // Gov
  demandType?: string; resp?: string; prazo?: string; prioridade?: string;
  // Sec
  dominio?: string; criticidade?: string;
  // Biz
  tipo?: string; fornecedor?: string; custo?: string;
  // Vault & wiki & general
  user?: string; pass?: string; notes?: string; descricao?: string;
  vaultCount?: number;
  // Innovation / Projects
  projetos?: string; ideias?: string; emAndamento?: string;
  // Agile
  fase?: string; tipoItem?: string; responsavelAgil?: string; esforco?: string; dataAlvo?: string;
  // Purchase / FinOps
  impactoPositivo?: string; impactoNegativo?: string; statusCompra?: string;
}

export interface EcoEdge {
  id: string;
  source: string;
  target: string;
  kind: 'spine' | 'auto' | 'manual';
}

export function levelMeta(v: string) {
  const map: Record<string, { color: string; label?: string }> = {
    'Baixa': { color: 'var(--accent-primary)' }, 'Média': { color: '#E0952B' },
    'Alta': { color: '#F97316' }, 'Crítica': { color: 'var(--color-error)' },
    'online': { color: 'var(--accent-primary)', label: 'Online' },
    'warning': { color: '#E0952B', label: 'Manutenção' },
    'offline': { color: 'var(--color-error)', label: 'Offline' }
  };
  return map[v] || { color: 'var(--accent-primary)' };
}

export function itemStatus(n: EcoNode) {
  if (n.group === 'agile') {
    switch (n.fase) {
      case 'backlog': return { label: 'Backlog', color: '#6b7280' };
      case 'todo': return { label: 'A Fazer', color: '#3b82f6' };
      case 'inprogress': return { label: 'Em Progresso', color: '#8b5cf6' };
      case 'review': return { label: 'Em Revisão', color: '#f59e0b' };
      case 'done': return { label: 'Concluído', color: 'var(--accent-primary)' };
      default: return { label: 'Backlog', color: '#6b7280' };
    }
  }

  if (n.group === 'purchase') {
    switch (n.statusCompra) {
      case 'Planeamento': return { label: 'Planeamento', color: '#6b7280' };
      case 'Cotação': return { label: 'Em Cotação', color: '#3b82f6' };
      case 'Aprovação': return { label: 'Aprovação Pendente', color: '#f59e0b' };
      case 'Aprovado': return { label: 'Aprovado', color: '#8b5cf6' };
      case 'Comprado': return { label: 'Comprado', color: 'var(--accent-primary)' };
      default: return { label: 'Aquisição', color: '#6b7280' };
    }
  }

  if (n.group === 'infra') { const m = levelMeta(n.status || 'online'); return { label: m.label || 'Online', color: m.color }; }
  if (n.group === 'inventory') { const m = levelMeta(n.estadoFisico || 'Em Uso'); return { label: m.label || 'Em Uso', color: m.color }; }
  if (n.group === 'gov') return { label: 'Prioridade ' + (n.prioridade || 'Média'), color: levelMeta(n.prioridade || 'Média').color };
  if (n.group === 'sec') return { label: 'Criticidade ' + (n.criticidade || 'Média'), color: levelMeta(n.criticidade || 'Média').color };
  return { label: n.tipo || 'Ativo', color: 'var(--accent-primary)' };
}

export function isAlert(n: EcoNode) {
  if (n.kind !== 'item') return false;
  if (n.group === 'infra') return n.status !== 'online';
  if (n.group === 'gov') return n.prioridade === 'Crítica';
  if (n.group === 'sec') return n.criticidade === 'Crítica' || n.criticidade === 'Alta';
  return false;
}

export function metaRows(n: EcoNode) {
  const g = n.group;
  const rows = [];
  if (g === 'infra') {
    if (n.hwType) rows.push({ label: 'TIPO', value: n.hwType });
    if (n.ip) rows.push({ label: 'IP / HOST', value: n.ip, mono: true });
  } else if (g === 'inventory') {
    if (n.hwType) rows.push({ label: 'TIPO', value: n.hwType });
    if (n.modelo) rows.push({ label: 'MODELO', value: n.modelo });
    if (n.serialNumber) rows.push({ label: 'S/N', value: n.serialNumber, mono: true });
    if (n.user) rows.push({ label: 'UTILIZADOR', value: n.user });
  } else if (g === 'gov') {
    if (n.demandType) rows.push({ label: 'DEMANDA', value: n.demandType });
    if (n.resp) rows.push({ label: 'RESP.', value: n.resp });
    if (n.prazo) rows.push({ label: 'PRAZO', value: n.prazo });
  } else if (g === 'sec') {
    if (n.dominio) rows.push({ label: 'DOMÍNIO', value: n.dominio });
    if (n.criticidade) rows.push({ label: 'CRITICIDADE', value: n.criticidade });
  } else if (g === 'biz') {
    if (n.tipo) rows.push({ label: 'TIPO', value: n.tipo });
    if (n.fornecedor) rows.push({ label: 'FORNECEDOR', value: n.fornecedor });
    if (n.custo) rows.push({ label: 'CUSTO ANUAL', value: n.custo, mono: true });
  } else if (g === 'agile') {
    if (n.tipoItem) rows.push({ label: 'TIPO', value: n.tipoItem });
    if (n.responsavelAgil) rows.push({ label: 'RESP.', value: n.responsavelAgil });
    if (n.dataAlvo) rows.push({ label: 'ENTREGA', value: n.dataAlvo, mono: true });
  } else if (g === 'purchase') {
    if (n.custo) rows.push({ label: 'CUSTO EST.', value: n.custo, mono: true });
    if (n.impactoPositivo) rows.push({ label: 'IMPACTO POS.', value: n.impactoPositivo });
  }
  return rows;
}
