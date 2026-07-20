import React, { useRef, useCallback, useState, useEffect } from 'react';
import { PILLARS, pillarById, itemStatus, metaRows, type EcoNode, type EcoEdge } from '../types/data';
import { Icon } from './Icon';

const OFF = 4000;

interface CanvasProps {
  nodes: EcoNode[];
  edges: EcoEdge[];
  selectedId: string | null;
  search: string;
  onSelectNode: (id: string | null) => void;
  onNodesChange: (nodes: EcoNode[]) => void;
  onEdgeCreated?: (source: string, target: string) => void;
  onOpenAdd: () => void;
}

function edgeD(a: EcoNode, b: { x: number; y: number; w: number; h: number }) {
  const sx = a.x + a.w / 2 + OFF, sy = a.y + a.h / 2 + OFF;
  const tx = b.x + b.w / 2 + OFF, ty = b.y + b.h / 2 + OFF;
  return `M ${sx} ${sy} L ${tx} ${ty}`;
}

export function Canvas({ nodes, edges, selectedId, search, onSelectNode, onNodesChange, onEdgeCreated }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ tx: 0, ty: 0, scale: 1 });
  const [drag, setDrag] = useState<any>(null);
  const dragRef = useRef<any>(null);
  const setDragState = useCallback((val: any) => {
    const next = typeof val === 'function' ? val(dragRef.current) : val;
    dragRef.current = next;
    setDrag(next);
  }, []);
  const [connect, setConnect] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  const nodeById = useCallback((id: string) => nodes.find(n => n.id === id), [nodes]);
  const itemNodes = nodes.filter(n => n.kind === 'item');
  const q = search.trim().toLowerCase();

  // Initialize canvas layout
  useEffect(() => {
    if (initialized || !canvasRef.current) return;
    if (nodes.length > 0) {
      setInitialized(true);
      setTimeout(() => fitView(nodes), 50);
      return;
    }
    const r = canvasRef.current.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2;
    const newNodes: EcoNode[] = [{ id: 'core', kind: 'core', x: cx - 80, y: cy - 80, w: 160, h: 160 }];
    const newEdges: EcoEdge[] = [];
    const rx = 470, ry = 320;
    const pillarNodesList = nodes.filter(n => n.kind === 'pillar');
    const pCount = pillarNodesList.length || 1;
    pillarNodesList.forEach((pl, i) => {
      const a = (-90 + i * (360 / pCount)) * Math.PI / 180;
      const px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a);
      newNodes.push({ ...pl, x: px - 110, y: py - 50, w: 220, h: 100 });
      newEdges.push({ id: 's' + pl.id, source: 'core', target: pl.id, kind: 'spine' });
    });
    // For initialization, we don't trigger edge creation to backend. 
    // Usually backend will return them, but if this runs, it's a fallback.
    onNodesChange(newNodes);
    setInitialized(true);
    setTimeout(() => fitView(newNodes), 50);
  }, [canvasRef.current]);

  // Pointer helpers
  const pt = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - transform.tx) / transform.scale,
      y: (e.clientY - rect.top - transform.ty) / transform.scale
    };
  }, [transform]);

  const hitTest = useCallback((x: number, y: number) => {
    return nodes.find(n => n.kind === 'item' && x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h);
  }, [nodes]);

  // Pan / Zoom
  const handleCanvasDown = (e: React.MouseEvent) => {
    setDragState({ mode: 'pan', cx: e.clientX, cy: e.clientY, tx: transform.tx, ty: transform.ty });
    onSelectNode(null);
  };

  const handleNodeDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const m = pt(e);
    const n = nodeById(id);
    if (!n) return;
    setDragState({ mode: 'node', id, cx: e.clientX, cy: e.clientY, gox: m.x - n.x, goy: m.y - n.y, moved: false });
  };

  const handleHandleDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const m = pt(e);
    setConnect({ source: id, x: m.x, y: m.y });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const m = pt(e);
      const currentDrag = dragRef.current;
      if (currentDrag?.mode === 'pan') {
        setTransform(t => ({ ...t, tx: currentDrag.tx + (e.clientX - currentDrag.cx), ty: currentDrag.ty + (e.clientY - currentDrag.cy) }));
      }
      if (currentDrag?.mode === 'node') {
        const moved = currentDrag.moved || Math.hypot(e.clientX - currentDrag.cx, e.clientY - currentDrag.cy) > 8;
        setDragState((d: any) => ({ ...d, moved }));
        const draggedNode = nodeById(currentDrag.id);
        if (draggedNode?.kind === 'pillar') return; // Prevent dragging pillars

        let newNodes = nodes.map(n => n.id === currentDrag.id ? { ...n, x: m.x - currentDrag.gox, y: m.y - currentDrag.goy } : n);
        
        // Manter pilares perfeitamente alinhados caso o nó central seja movido
        const core = newNodes.find(n => n.id === 'core');
        if (core) {
          const pillarNodesList = newNodes.filter(n => n.kind === 'pillar');
          const pCount = pillarNodesList.length || 1;
          newNodes = newNodes.map(n => {
            if (n.kind === 'pillar') {
              const i = pillarNodesList.findIndex(p => p.id === n.id);
              if (i >= 0) {
                const rx = 470, ry = 320;
                const a = (-90 + i * (360 / pCount)) * Math.PI / 180;
                const cx = core.x + core.w / 2;
                const cy = core.y + core.h / 2;
                return { ...n, x: Math.round(cx + rx * Math.cos(a) - 110), y: Math.round(cy + ry * Math.sin(a) - 50) };
              }
            }
            return n;
          });
        }
        onNodesChange(newNodes);
      }
      if (connect) setConnect((c: any) => ({ ...c, x: m.x, y: m.y }));
    };
    const onUp = (e: MouseEvent) => {
      const currentDrag = dragRef.current;
      if (connect && canvasRef.current) {
        const m = pt(e);
        const target = hitTest(m.x, m.y);
        if (target && target.id !== connect.source) {
          const dup = edges.some(ed => (ed.source === connect.source && ed.target === target.id) || (ed.source === target.id && ed.target === connect.source));
          if (!dup && onEdgeCreated) onEdgeCreated(connect.source, target.id);
        }
      }
      if (currentDrag?.mode === 'node' && !currentDrag.moved) {
        const n = nodeById(currentDrag.id);
        if (n?.kind === 'item' || n?.kind === 'pillar') onSelectNode(currentDrag.id);
      }
      setDragState(null);
      setConnect(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag, connect, nodes, edges]);

  // Auto-organização (caso os dados carregados tenham pilares desorganizados)
  useEffect(() => {
    const core = nodes.find(n => n.id === 'core');
    if (!core) return;
    let changed = false;
    const pillarNodesList = nodes.filter(n => n.kind === 'pillar');
    const pCount = pillarNodesList.length || 1;
    const newNodes = nodes.map(n => {
      if (n.kind === 'pillar') {
        const i = pillarNodesList.findIndex(p => p.id === n.id);
        if (i >= 0) {
          const rx = 470, ry = 320;
          const a = (-90 + i * (360 / pCount)) * Math.PI / 180;
          const cx = core.x + core.w / 2;
          const cy = core.y + core.h / 2;
          const px = Math.round(cx + rx * Math.cos(a) - 110);
          const py = Math.round(cy + ry * Math.sin(a) - 50);
          if (Math.abs(n.x - px) > 1 || Math.abs(n.y - py) > 1) {
            changed = true;
            return { ...n, x: px, y: py };
          }
        }
      }
      return n;
    });
    if (changed) {
      onNodesChange(newNodes);
    }
  }, [nodes]);

  // Zoom
  const zoomAt = (px: number, py: number, factor: number) => {
    setTransform(t => {
      const ns = Math.min(1.6, Math.max(0.3, t.scale * factor));
      const wx = (px - t.tx) / t.scale, wy = (py - t.ty) / t.scale;
      return { scale: ns, tx: px - wx * ns, ty: py - wy * ns };
    });
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.1 : 1 / 1.1);
  };
  const zoomBtn = (factor: number) => {
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, factor);
  };
  const fitView = (ns?: EcoNode[]) => {
    const list = ns || nodes;
    if (!list.length || !canvasRef.current) return;
    const left = Math.min(...list.map(n => n.x)), top = Math.min(...list.map(n => n.y));
    const right = Math.max(...list.map(n => n.x + n.w)), bottom = Math.max(...list.map(n => n.y + n.h));
    const r = canvasRef.current.getBoundingClientRect();
    const scale = Math.min(1.1, Math.max(0.3, Math.min((r.width - 140) / (right - left), (r.height - 120) / (bottom - top))));
    const cx2 = (left + right) / 2, cy2 = (top + bottom) / 2;
    setTransform({ scale, tx: r.width / 2 - cx2 * scale, ty: r.height / 2 - cy2 * scale });
  };

  const gridStyle: React.CSSProperties = {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--text-primary) 15%, transparent) 1.2px, transparent 1.2px)',
    backgroundSize: `${26 * transform.scale}px ${26 * transform.scale}px`,
    backgroundPosition: `${transform.tx}px ${transform.ty}px`
  };
  const innerStyle: React.CSSProperties = {
    position: 'absolute', left: 0, top: 0,
    transform: `translate(${transform.tx}px,${transform.ty}px) scale(${transform.scale})`,
    transformOrigin: '0 0'
  };
  const svgStyle: React.CSSProperties = {
    position: 'absolute', left: -OFF, top: -OFF, width: OFF * 2, height: OFF * 2, overflow: 'visible', pointerEvents: 'none'
  };

  const coreN = nodeById('core');

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: 'var(--bg-main)', cursor: 'default' }}>
      <style>{`
        @keyframes dashflow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes cardFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      <div ref={canvasRef} onMouseDown={handleCanvasDown} onWheel={handleWheel} style={{ position: 'absolute', inset: 0 }}>
        <div style={gridStyle} />
        <div style={innerStyle}>
          {/* SVG Edges */}
          <svg style={svgStyle}>
            {edges.map(e => {
              const a = nodeById(e.source), b = nodeById(e.target);
              if (!a || !b) return null;
              const spine = e.kind === 'spine';
              const plColor = (spine && b.kind === 'pillar') ? (b.color || 'var(--accent-primary)') : 'var(--accent-primary)';
              const sttColor = (!spine && b.kind === 'item') ? itemStatus(b).color : 'var(--accent-primary)';
              const d = edgeD(a, b);
              return (
                <g key={e.id}>
                  {/* Invisible wide path for easy clicking if needed later */}
                  <path d={d} fill="none" stroke="transparent" strokeWidth={16} />
                  <path d={d} fill="none" stroke={spine ? plColor : sttColor} strokeWidth={spine ? 2.5 : 3} strokeDasharray={spine ? '8 6' : '10 8'} opacity={spine ? 0.8 : 0.6} style={{ animation: 'dashflow 3s linear infinite' }} />
                </g>
              );
            })}
            {connect && (() => {
              const a = nodeById(connect.source);
              if (!a) return null;
              return <path d={edgeD(a, { x: connect.x, y: connect.y, w: 0, h: 0 })} fill="none" stroke="var(--accent-primary)" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 7" opacity={0.7} />;
            })()}
          </svg>

          {coreN && (
            <div style={{ position: 'absolute', left: coreN.x, top: coreN.y, width: coreN.w, height: coreN.h, borderRadius: 16, background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', boxShadow: '0 8px 32px color-mix(in srgb, var(--accent-primary) 15%, transparent)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', textAlign: 'left', gap: 16, cursor: 'grab', zIndex: 4 }} onMouseDown={e => handleNodeDown('core', e)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)' }}>
                <Icon name="ecosystem" color="var(--accent-primary)" size={24} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', lineHeight: 1.3, color: 'var(--text-primary)' }}>PLANO<br/>ESTRATÉGICO</div>
            </div>
          )}

          {/* Pillars */}
          {nodes.filter(n => n.kind === 'pillar').map(pl => {
            const n = pl;
            const items = itemNodes.filter(it => it.pillar === pl.id);
            const cnt = items.length;
            const dim = q && !(pl.name.toLowerCase().includes(q) || pl.short.toLowerCase().includes(q));
            
            const nOn = items.filter(it => it.status === 'online').length;
            const nMan = items.filter(it => it.status === 'manutencao').length;
            const nOff = items.filter(it => it.status === 'offline').length;
            
            return (
              <div key={pl.id} style={{ position: 'absolute', left: n.x, top: n.y, width: n.w, cursor: 'pointer', zIndex: 3, opacity: dim ? 0.3 : 1, transition: 'opacity .2s', animation: 'nodeIn .35s ease, cardFloat 8s ease-in-out infinite' }} onMouseDown={e => handleNodeDown(pl.id, e)}>
                <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${pl.color}`, borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', boxSizing: 'border-box', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px 8px' }}>
                    <div style={{ marginTop: 2 }}><Icon name={pl.icon} color={pl.color} size={18} /></div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: pl.color, letterSpacing: '.05em' }}>PILAR {pl.num}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.2, color: 'var(--text-primary)', marginTop: 2 }}>{pl.name}</div>
                    </div>
                  </div>
                  <div style={{ padding: '4px 14px 10px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{cnt} {cnt === 1 ? 'ativo' : 'ativos'}</div>
                  <div style={{ borderTop: '1px solid var(--border-main)', padding: '10px 14px', display: 'flex', gap: 14, fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent-primary)' }} />{nOn}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: '#f59e0b' }} />{nMan}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: '#ef4444' }} />{nOff}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Items */}
          {itemNodes.map(n => {
            const pl = pillarById(n.pillar || '');
            if (!pl) return null;
            const stt = itemStatus(n);
            const sel = n.id === selectedId;
            const hay = `${n.name} ${pl.name} ${pl.short} ${n.ip || ''} ${n.fornecedor || ''} ${n.dominio || ''} ${n.tipo || ''}`.toLowerCase();
            const dim = q && !hay.includes(q);
            
            const shadow = sel ? `0 0 0 2px var(--accent-primary), 0 12px 40px rgba(0,0,0,0.12)` : `0 6px 20px rgba(0,0,0,0.06)`;
            const rows = metaRows(n);
            
            return (
              <div key={n.id} className="eco-node-card" style={{ position: 'absolute', left: n.x, top: n.y, width: n.w, cursor: 'pointer', opacity: dim ? 0.28 : 1, zIndex: sel ? 8 : 5, animation: 'nodeIn .3s cubic-bezier(.22,1,.36,1)' }} onMouseDown={e => handleNodeDown(n.id, e)}>
                <div style={{ width: '100%', background: 'var(--bg-surface)', borderRadius: 12, boxShadow: shadow, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-main)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
                  {/* Connection handles */}
                  {['top', 'left', 'right', 'bottom'].map(pos => {
                    const style: React.CSSProperties = {
                      position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: 'var(--bg-card)', border: `2px solid ${sel ? 'var(--accent-primary)' : 'var(--border-main)'}`, cursor: 'crosshair', zIndex: 6,
                      ...(pos === 'top' ? { left: '50%', top: -6, transform: 'translateX(-50%)' } : {}),
                      ...(pos === 'bottom' ? { left: '50%', bottom: -6, transform: 'translateX(-50%)' } : {}),
                      ...(pos === 'left' ? { left: -6, top: '50%', transform: 'translateY(-50%)' } : {}),
                      ...(pos === 'right' ? { right: -6, top: '50%', transform: 'translateY(-50%)' } : {}),
                    };
                    return <div key={pos} style={style} onMouseDown={e => handleHandleDown(n.id, e)} />;
                  })}
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'var(--bg-surface)' }}>
                      <Icon name={pl.icon} color="var(--text-secondary)" size={16} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {n.name}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: stt.color, animation: stt.color === 'var(--accent-primary)' ? 'ecoPulse 2s infinite' : 'none' }}></span>
                        {stt.label}
                      </div>
                    </div>
                    {rows.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{r.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', fontFamily: r.mono ? "'JetBrains Mono', monospace" : 'inherit' }}>
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div style={{ background: stt.color, color: '#fff', padding: '8px', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                    Detalhes
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state hint */}
      {itemNodes.length === 0 && nodes.length > 0 && (
        <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 24, padding: '9px 18px', boxShadow: '0 8px 24px rgba(0,0,0,.4)', animation: 'fadeIn .6s ease', zIndex: 20 }}>
          <Icon name="spark" color="var(--accent-primary)" size={17} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Os pilares estão prontos — cadastre seu primeiro ativo ou demanda.</span>
        </div>
      )}

      {/* Canvas toolbar (Top Left) */}
      <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 4, gap: 2, boxShadow: '0 4px 14px rgba(0,0,0,0.4)', zIndex: 20 }}>
        {/* Connection button logic placeholder, keeping it simple as before: connect mode happens on handle drag */}
        <button onClick={() => fitView()} style={{ border: 'none', borderRadius: 9, padding: '8px 14px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)' }}>Ajustar Visualização</button>
      </div>

      {/* Minimap & Zoom */}
      <div style={{ position: 'absolute', right: 16, bottom: 14, display: 'flex', alignItems: 'flex-end', gap: 10, zIndex: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <button onClick={() => zoomBtn(1.2)} aria-label="Ampliar zoom" style={{ width: 32, height: 32, border: '1px solid var(--border-main)', borderRadius: 9, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>+</button>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>{Math.round(transform.scale * 100)}%</span>
          <button onClick={() => zoomBtn(1 / 1.2)} aria-label="Reduzir zoom" style={{ width: 32, height: 32, border: '1px solid var(--border-main)', borderRadius: 9, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>−</button>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>
          <svg width={168} height={118} viewBox="0 0 168 118">
            <rect x={0} y={0} width={168} height={118} rx={8} fill="var(--bg-main)" />
            <circle cx={84} cy={59} r={6} fill="none" stroke="var(--accent-primary)" strokeWidth={1.5} />
            {nodes.filter(n => n.kind === 'pillar').map((p, i, arr) => {
               const pCount = arr.length || 1;
               const a = (-90 + i * (360 / pCount)) * Math.PI / 180;
               const px = 84 + 35 * Math.cos(a);
               const py = 59 + 25 * Math.sin(a);
               return <circle key={p.id} cx={px} cy={py} r={4} fill={p.color} opacity={0.9} />
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
