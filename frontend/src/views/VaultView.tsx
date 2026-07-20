import { useState, useEffect } from 'react';
import { EcoITApi } from '../services/api';
import { Icon } from '../components/Icon';

export function VaultView() {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, { plain: string; expiresAt: number }>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSecrets();
    const interval = setInterval(() => {
      setRevealed(prev => {
        const now = Date.now();
        const next = { ...prev };
        let changed = false;
        for (const [id, data] of Object.entries(next)) {
          if (now > data.expiresAt) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecrets = async () => {
    try {
      const data = await EcoITApi.listAllSecrets();
      setSecrets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reveal = async (vaultId: string) => {
    try {
      const plain = await EcoITApi.revealSecret(vaultId);
      setRevealed(prev => ({
        ...prev,
        [vaultId]: { plain, expiresAt: Date.now() + 30000 }
      }));
    } catch (e) {
      console.error(e);
      alert('Erro ao revelar segredo.');
    }
  };

  const filtered = secrets.filter(s => {
    const term = search.toLowerCase();
    return s.node?.name?.toLowerCase().includes(term) || s.usernameOrToken?.toLowerCase().includes(term);
  });

  return (
    <div style={{ padding: 40, width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px' }}>Cofre Central</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gestão de segredos e credenciais de todos os ativos.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--border-main)' }}>
            <Icon name="search" size={16} color="var(--text-muted)" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar segredos..."
              style={{ border: 'none', outline: 'none', marginLeft: 8, width: 200, fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Carregando cofres...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Nenhum segredo encontrado.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(secret => {
              const rev = revealed[secret.id];
              return (
                <div key={secret.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="lock" size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{secret.node?.name || 'Desconhecido'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{secret.usernameOrToken || 'Sem identificador'}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-main)' }}>
                    {rev ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'var(--accent-primary)', fontWeight: 800 }}>
                          {rev.plain}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Expira em {Math.ceil((rev.expiresAt - Date.now()) / 1000)}s
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 24, color: 'var(--text-muted)', letterSpacing: '0.15em', lineHeight: 1, paddingTop: 8 }}>
                        ••••••••
                      </div>
                    )}
                    
                    {!rev && (
                      <button onClick={() => reveal(secret.id)} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-main)', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-primary) 10%, var(--bg-surface))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                      >
                        Revelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
