import { Icon } from './Icon';

const NAV_ITEMS = [
  { key: 'ecosystem', label: 'Ecossistema', icon: 'ecosystem' },
  { key: 'nodes', label: 'Ativos', icon: 'nodes' },
  { key: 'inventory', label: 'Inventário', icon: 'servidor' },
  { key: 'connections', label: 'Conexões', icon: 'connections' },
  { key: 'finops', label: 'FinOps & Aquisições', icon: 'dollar' },
  { key: 'secrets', label: 'Cofre', icon: 'secrets' },
  { key: 'settings', label: 'Configurações', icon: 'settings' },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (key: string) => void;
  counts: { items: number; connections: number; alerts: number };
}

export function Sidebar({ activeNav, onNavChange, counts }: SidebarProps) {
  return (
    <aside style={{ width: 240, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column', padding: '16px 12px' }}>
      {/* Logo */}
      <div style={{ padding: '30px 24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), #9f3611)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="ecosystem" color="var(--accent-text)" size={20} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--text-primary)' }}>Eco<span style={{ color: 'var(--accent-primary)' }}>IT</span></div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV_ITEMS.map(item => {
          const active = activeNav === item.key;
          return (
            <div
              key={item.key}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => onNavChange(item.key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                background: active ? 'var(--bg-surface-hover)' : 'transparent',
                border: active ? '1px solid var(--border-main)' : '1px solid transparent',
                fontWeight: active ? 800 : 700
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex' }}><Icon name={item.icon} color={active ? 'var(--accent-primary)' : 'var(--text-primary)'} size={16} /></span>
                {item.label}
              </div>
              {item.key === 'ecosystem' && counts.alerts > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, background: '#ef4444', color: 'var(--accent-text)', borderRadius: 999, padding: '1px 7px' }}>{counts.alerts}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Status Overview (Hidden in Dark Mode to match HTML, or kept? Let's keep it but dark) */}


    </aside>
  );
}
