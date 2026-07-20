import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.node.deleteMany();

  await prisma.node.createMany({
    data: [
      { name: 'Servidor Central', category: 'infra', positionX: 100, positionY: 100, metadata: JSON.stringify({ ip: '192.168.1.10', status: 'active' }) },
      { name: 'Política de Acessos', category: 'sec', positionX: 400, positionY: 100, metadata: JSON.stringify({ version: '1.2', lastAudit: '2023-10-01' }) },
      { name: 'Portal do Cidadão', category: 'gov', positionX: 100, positionY: 300, metadata: JSON.stringify({ activeUsers: 5000, uptime: '99.9%' }) },
      { name: 'Gestão de Frota', category: 'biz', positionX: 400, positionY: 300, metadata: JSON.stringify({ vehicles: 150, manager: 'João Silva' }) }
    ]
  });

  console.log('Seed executado com sucesso! 4 Nodes criados.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
