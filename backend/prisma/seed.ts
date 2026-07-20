import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pillars = [
    { id: 'p1', num: '01', name: 'Governança e Gestão de Ativos', short: 'Governança', color: '#6366F1', icon: 'gov', group: 'gov' },
    { id: 'p2', num: '02', name: 'Infraestrutura e Nuvem', short: 'Infra & Nuvem', color: '#10B981', icon: 'servidor', group: 'infra' },
    { id: 'p3', num: '03', name: 'Segurança e Compliance', short: 'Segurança', color: '#DC4A3D', icon: 'firewall', group: 'sec' },
    { id: 'p4', num: '04', name: 'Serviços e Processos (ITIL)', short: 'Serviços ITIL', color: '#0EA5E9', icon: 'connections', group: 'gov' },
    { id: 'p5', num: '05', name: 'Dados e Inteligência (BI)', short: 'Dados & BI', color: '#8B5CF6', icon: 'chart', group: 'biz' },
    { id: 'p6', num: '06', name: 'Pessoas e Capacitação', short: 'Pessoas', color: '#E0952B', icon: 'users', group: 'gov' },
    { id: 'p7', num: '07', name: 'Financeiro e Fornecedores (FinOps)', short: 'FinOps', color: '#0D9488', icon: 'dollar', group: 'biz' },
    { id: 'p8', num: '08', name: 'Inovação, IA e BPO', short: 'Inovação & IA', color: '#EC4899', icon: 'cpu', group: 'biz' }
  ];

  for (const p of pillars) {
    await prisma.macroPillar.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log('✅ Seed: 8 Pilares Macros pré-carregados com sucesso!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
