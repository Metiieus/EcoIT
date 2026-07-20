import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Canvas } from './components/Canvas';
import { NodeModal } from './components/NodeModal';
import { NodeDrawer } from './components/NodeDrawer';
import { PILLARS, pillarById, updatePillars, isAlert, type EcoNode, type EcoEdge } from './types/data';
import { EcoITApi } from './services/api';
import { NodesView } from './views/NodesView';
import { ConnectionsView } from './views/ConnectionsView';
import { VaultView } from './views/VaultView';
import { SettingsView } from './views/SettingsView';
import { FinOpsView } from './views/FinOpsView';
import { InventoryView } from './views/InventoryView';

const IW = 240;
const IH = 140;

function blankForm() {
  return {
    name: '', pillar: null as string | null, hwType: 'Servidor', ip: '', status: 'online',
    demandType: 'Política PSI', resp: 'Gestor', prazo: '', prioridade: 'Média',
    dominio: 'Identidade / MFA', criticidade: 'Média',
    tipo: 'Dashboard BI', fornecedor: '', custo: '', user: '', pass: '', notes: '',
    descricao: '', id: '', projetos: '', ideias: '', emAndamento: '',
    fase: 'backlog', tipoItem: 'Projeto', responsavelAgil: '', esforco: '', dataAlvo: '',
    impactoPositivo: '', impactoNegativo: '', statusCompra: 'Planeamento',
    modelo: '', serialNumber: '', loc: '', estadoFisico: 'Em Uso'
  };
}

// Simple Toast system
function Toast({ msg, type = 'error' }: { msg: string, type?: 'error' | 'success' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'error' ? 'var(--color-error)' : 'var(--accent-primary)',
      color: 'var(--accent-text)', padding: '12px 20px', borderRadius: 12,
      fontWeight: 600, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      animation: 'drawerIn 0.3s ease'
    }}>
      {msg}
    </div>
  );
}

function App() {
  const [nodes, setNodes] = useState<EcoNode[]>([]);
  const [edges, setEdges] = useState<EcoEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('ecosystem');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; form: ReturnType<typeof blankForm> } | null>(null);
  const [splash, setSplash] = useState(true);
  
  // Dynamic Settings
  const [demandTypes, setDemandTypes] = useState<string[]>(['Política PSI', 'SAM / Licenciamento', 'Catálogo ITIL', 'Treinamento', 'Onboarding']);
  const [macroPillars, setMacroPillars] = useState<any[]>(PILLARS);
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  
  // Status
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type?: 'error' | 'success' } | null>(null);

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  const loadGraph = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const data = await EcoITApi.fetchGraph();
      
      const backendPillars = data.pillars && data.pillars.length > 0 ? data.pillars : PILLARS;
      setMacroPillars(backendPillars);
      updatePillars(backendPillars);
      
      try {
        const dt = await EcoITApi.getSetting('demand_types');
        if (dt && dt.value) {
          setDemandTypes(JSON.parse(dt.value));
        }
      } catch (e) {}

      // Map backend fields to frontend
      const mappedNodes: EcoNode[] = [
        { id: 'core', kind: 'core', x: 0, y: 0, w: 200, h: 80 },
        ...backendPillars.map((p: any) => ({ ...p, kind: 'pillar' as const, x: 0, y: 0, w: 220, h: 100 })),
        ...data.nodes.map((n: any) => ({
          ...n,
          kind: 'item',
          x: n.positionX,
          y: n.positionY,
          w: IW,
          h: IH,
          pillar: n.pillarId,
          ...n.metadata,
          // Convert internal count back if needed, else we can inject it
          vaultCount: n.vaultCount
        }))
      ];
      
      const mappedEdges: EcoEdge[] = [
        ...backendPillars.map((p: any) => ({ id: 's' + p.id, source: 'core', target: p.id, kind: 'spine' as const })),
        ...data.nodes.map((n: any) => ({ id: 'a' + n.id, source: n.pillarId, target: n.id, kind: 'auto' as const })),
        ...data.edges.filter((e: any) => e.kind !== 'auto').map((e: any) => ({
          id: e.id,
          source: e.sourceId,
          target: e.targetId,
          kind: e.kind as any
        }))
      ];

      setNodes(mappedNodes);
      setEdges(mappedEdges);
    } catch (e: any) {
      console.error(e);
      setErrorState('Falha ao conectar com o servidor. Verifique se o backend está a rodar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
    const t = setTimeout(() => setSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') e.preventDefault();
      if (e.key === 'Escape') { setModal(null); setSelectedId(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openAdd = (pillarId?: string) => setModal({ mode: 'add', form: { ...blankForm(), pillar: pillarId || null } });
  const openEdit = () => {
    const n = nodes.find(x => x.id === selectedId);
    if (n) setModal({ mode: 'edit', form: { ...blankForm(), ...n, pillar: n.pillar || null } });
  };

  const saveModal = async () => {
    if (!modal) return;
    const { mode, form } = modal;
    if (!form.name.trim() || !form.pillar) return;
    const pillar = pillarById(form.pillar);
    if (!pillar) return;

    const metadata = {
      hwType: form.hwType, ip: form.ip, status: form.status,
      demandType: form.demandType, resp: form.resp, prazo: form.prazo, prioridade: form.prioridade,
      dominio: form.dominio, criticidade: form.criticidade,
      tipo: form.tipo, fornecedor: form.fornecedor, custo: form.custo,
      descricao: form.descricao, projetos: form.projetos, ideias: form.ideias, emAndamento: form.emAndamento,
      fase: form.fase, tipoItem: form.tipoItem, responsavelAgil: form.responsavelAgil, esforco: form.esforco, dataAlvo: form.dataAlvo,
      impactoPositivo: form.impactoPositivo, impactoNegativo: form.impactoNegativo, statusCompra: form.statusCompra,
      modelo: form.modelo, serialNumber: form.serialNumber, loc: form.loc, estadoFisico: form.estadoFisico, user: form.user
    };

    try {
      if (mode === 'edit') {
        const payload = {
          name: form.name.trim(),
          pillarId: form.pillar,
          group: pillar.group,
          metadata
        };
        const updated = await EcoITApi.updateNode(form.id, payload);
        
        setNodes(prev => {
          const old = prev.find(n => n.id === form.id);
          if (old && old.pillar !== form.pillar) {
            setEdges(es => es.map(ed => (ed.kind === 'auto' && ed.target === form.id) ? { ...ed, source: form.pillar! } : ed));
          }
          return prev.map(n => n.id === form.id ? { ...n, name: updated.name, pillar: updated.pillarId, group: updated.group, ...updated.metadata } : n);
        });
      } else {
        // Add mode
        const count = nodes.filter(n => n.kind === 'item' && n.pillar === form.pillar).length;
        const pn = nodes.find(n => n.id === form.pillar);
        const core = nodes.find(n => n.id === 'core');
        let x = 100, y = 100;
        // The frontend Canvas layout logic for new nodes needs to roughly place it.
        // If it's 0,0 initially, Canvas usually runs a layout pass, but since we rely on DB coords:
        if (pn && core && pn.x !== 0) {
          const pcx = pn.x + pn.w / 2, pcy = pn.y + pn.h / 2;
          const ccx = core.x + core.w / 2, ccy = core.y + core.h / 2;
          const base = Math.atan2(pcy - ccy, pcx - ccx);
          const a = base + ((count % 4) - 1.5) * 0.45;
          const rad = 420 + Math.floor(count / 4) * 220;
          x = pcx + Math.cos(a) * rad - IW / 2;
          y = pcy + Math.sin(a) * rad - IH / 2;
        }

        const res = await EcoITApi.createNode({
          name: form.name.trim(),
          pillarId: form.pillar,
          group: pillar.group,
          metadata,
          notes: ''
        });
        
        // Use the returned ID and edge
        setNodes(prev => [...prev, {
          id: res.node.id, kind: 'item', x: res.node.positionX || x, y: res.node.positionY || y, w: IW, h: IH, 
          name: res.node.name, pillar: res.node.pillarId, group: res.node.group, notes: res.node.notes,
          ...res.node.metadata
        } as EcoNode]);
        setEdges(prev => [...prev, { id: res.edge.id, source: res.edge.sourceId, target: res.edge.targetId, kind: res.edge.kind }]);
        setSelectedId(res.node.id);
      }
      setModal(null);
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const deleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm('Tem certeza que deseja excluir este ativo e suas credenciais?')) return;
    try {
      await EcoITApi.deleteNode(selectedId);
      setNodes(prev => prev.filter(n => n.id !== selectedId));
      setEdges(prev => prev.filter(e => e.source !== selectedId && e.target !== selectedId));
      setSelectedId(null);
      showToast('Item excluído', 'success');
    } catch (e: any) {
      showToast(e.message);
    }
  };

  // Immediate local update + debounce API for nodes drag
  const dragTimeout = useRef<any>(null);
  const updateNodeLocal = (patch: Partial<EcoNode>) => {
    if (!selectedId) return;
    setNodes(prev => prev.map(n => n.id === selectedId ? { ...n, ...patch } : n));
    if (patch.x !== undefined && patch.y !== undefined) {
      if (dragTimeout.current) clearTimeout(dragTimeout.current);
      dragTimeout.current = setTimeout(() => {
        EcoITApi.updatePosition(selectedId, patch.x!, patch.y!).catch(console.error);
      }, 400);
    }
  };

  const handleManualEdge = async (source: string, target: string) => {
    try {
      const res = await EcoITApi.createEdge(source, target, 'manual');
      setEdges(prev => [...prev, { id: res.id, source: res.sourceId, target: res.targetId, kind: res.kind as any }]);
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleDeleteEdge = async (id: string) => {
    try {
      await EcoITApi.deleteEdge(id);
      setEdges(prev => prev.filter(e => e.id !== id));
      showToast('Conexão removida', 'success');
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const itemNodes = nodes.filter(n => n.kind === 'item');
  const alerts = itemNodes.filter(n => isAlert(n)).length;
  const selectedNode = selectedId ? nodes.find(n => n.id === selectedId && (n.kind === 'item' || n.kind === 'pillar')) : undefined;

  if (splash) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
        {/* Textura de fundo */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(var(--accent-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Ícone animado (overlay) */}
        <div style={{ position: 'relative', zIndex: 10, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <img src="/gorilla-icon.png" alt="Loading Icon" style={{ width: 180, height: 180, objectFit: 'contain', mixBlendMode: 'multiply', filter: 'drop-shadow(0 0 20px rgba(233,84,32,0.3))' }} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 10, marginTop: 40, width: 200, background: 'var(--bg-surface)', padding: 12, borderRadius: 12, border: '1px solid var(--border-main)', boxShadow: '0 6px 18px rgba(14,59,42,.06)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.15em', color: 'var(--text-primary)', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>CARREGANDO AMBIENTE</div>
          <div style={{ width: '100%', height: 4, background: 'var(--bg-surface-hover)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent-primary)', width: '100%', animation: 'progress 3s ease-in-out forwards' }} />
          </div>
        </div>
        <style>{`
          @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--accent-primary)', fontWeight: 600 }}>
        A carregar ecossistema...
      </div>
    );
  }

  if (errorState) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', gap: 16 }}>
        <div style={{ color: 'var(--color-error)', fontWeight: 600 }}>{errorState}</div>
        <button onClick={loadGraph} style={{ padding: '10px 20px', background: 'var(--accent-primary)', color: 'var(--accent-text)', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        counts={{
          items: itemNodes.length,
          connections: edges.filter(e => e.kind !== 'spine').length,
          alerts
        }}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar search={search} onSearch={setSearch} onAdd={openAdd} theme={theme} onToggleTheme={toggleTheme} />
        {activeNav === 'ecosystem' ? (
          <Canvas
            nodes={nodes}
            edges={edges}
            selectedId={selectedId}
            search={search}
            onSelectNode={setSelectedId}
            onNodesChange={setNodes}
            onEdgeCreated={handleManualEdge}
            onOpenAdd={openAdd}
          />
        ) : activeNav === 'nodes' ? (
          <NodesView 
            nodes={nodes} 
            onEditNode={(id) => { setSelectedId(id); openEdit(); }}
            onDeleteNode={(id) => { setSelectedId(id); deleteSelected(); }} 
          />
        ) : activeNav === 'connections' ? (
          <ConnectionsView
            nodes={nodes}
            edges={edges}
            onDeleteEdge={handleDeleteEdge}
          />
        ) : activeNav === 'finops' ? (
          <FinOpsView
            nodes={nodes}
            onEditNode={(id) => { setSelectedId(id); openEdit(); }}
            onAddNode={() => {
              const finOpsPillar = nodes.find(n => n.kind === 'pillar' && (n.group === 'purchase' || n.group === 'biz'));
              openAdd(finOpsPillar?.id);
            }}
          />
        ) : activeNav === 'inventory' ? (
          <InventoryView
            nodes={nodes}
            onEditNode={(id) => { setSelectedId(id); openEdit(); }}
            onAddNode={() => {
              const invPillar = nodes.find(n => n.kind === 'pillar' && n.group === 'inventory');
              openAdd(invPillar?.id);
            }}
            onDeleteNode={(id) => { setSelectedId(id); deleteSelected(); }}
          />
        ) : activeNav === 'secrets' ? (
          <VaultView />
        ) : activeNav === 'settings' ? (
          <SettingsView counts={{ items: itemNodes.length, connections: edges.filter(e => e.kind !== 'spine').length }} macroPillars={macroPillars} demandTypes={demandTypes} onSettingsUpdate={loadGraph} />
        ) : null}
      </div>

      {selectedNode && (
        <NodeDrawer
          node={selectedNode}
          nodes={nodes}
          edges={edges}
          onClose={() => setSelectedId(null)}
          onEdit={openEdit}
          onDelete={deleteSelected}
          onUpdateNode={updateNodeLocal}
          onOpenAdd={() => { const pid = selectedNode.id; setSelectedId(null); openAdd(pid); }}
        />
      )}

      {modal && (
        <NodeModal
          mode={modal.mode}
          form={modal.form}
          demandTypes={demandTypes}
          macroPillars={macroPillars}
          onClose={() => setModal(null)}
          onSave={saveModal}
          onFormChange={(patch) => setModal(m => m ? { ...m, form: { ...m.form, ...patch } } : m)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

export default App;
