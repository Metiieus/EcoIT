import { Icon } from './Icon';

interface TopbarProps {
  search: string;
  onSearch: (val: string) => void;
  onAdd: () => void;
  theme: string;
  onToggleTheme: () => void;
}

export function Topbar({ search, onSearch, onAdd, theme, onToggleTheme }: TopbarProps) {
  return (
    <header style={{ height: 62, flexShrink: 0, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px' }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Canvas Executivo</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent-primary)' }}></span>Salvo agora
      </div>
      
      <div style={{ flex: 1 }} />
      
      <div style={{ width: 320, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 11, padding: '8px 13px' }}>
        <Icon name="search" color="var(--text-muted)" size={15} />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Buscar ativo..."
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-surface-active)', border: '1px solid var(--border-main)', borderRadius: 6, padding: '2px 6px', fontFamily: "'JetBrains Mono', monospace" }}>⌘K</span>
      </div>
      
      <button style={{ position: 'relative', width: 38, height: 38, borderRadius: 11, border: '1px solid var(--border-main)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        <Icon name="bell" size={16} />
        <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 9.5, fontWeight: 800, background: '#ef4444', color: 'var(--accent-text)', borderRadius: 999, padding: '1px 6px' }}>3</span>
      </button>

      <button
        onClick={onToggleTheme}
        style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid var(--border-main)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
        title="Alternar tema"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      
      <button
        onClick={onAdd}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: 'none', borderRadius: 11, background: 'var(--accent-primary)', color: 'var(--accent-text)', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
      >
        + Novo Ativo
      </button>
    </header>
  );
}
