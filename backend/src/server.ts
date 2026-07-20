import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import ecosystemRoutes from './routes/ecosystem';
import vaultRoutes from './routes/vault';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Validar ENCRYPTION_KEY
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 32) {
  console.error('❌ ERRO CRÍTICO: A variável ENCRYPTION_KEY não está definida ou não tem 32 caracteres (256 bits).');
  console.error('Por favor, defina a variável no ficheiro .env');
  process.exit(1);
}

// CORS restrito
app.use(cors({
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' })); // Blindagem para grandes textos da Wiki Markdown

// Rotas da API
app.use('/api', ecosystemRoutes);
app.use('/api/vault', vaultRoutes);

const PORT = parseInt(process.env.PORT || '3333', 10);
const HOST = '127.0.0.1';

// Seed e Start
async function bootstrap() {
  try {
    const PILLARS = [
      { id: 'p1', num: '01', name: 'Governança e Gestão de Ativos', short: 'Governança', color: '#6366F1', icon: 'gov', group: 'gov' },
      { id: 'p2', num: '02', name: 'Infraestrutura e Nuvem', short: 'Infra & Nuvem', color: '#10B981', icon: 'servidor', group: 'infra' },
      { id: 'p3', num: '03', name: 'Segurança e Compliance', short: 'Segurança', color: '#DC4A3D', icon: 'firewall', group: 'sec' },
      { id: 'p4', num: '04', name: 'Serviços e Processos (ITIL)', short: 'Serviços ITIL', color: '#0EA5E9', icon: 'connections', group: 'gov' },
      { id: 'p5', num: '05', name: 'Dados e Inteligência (BI)', short: 'Dados & BI', color: '#8B5CF6', icon: 'chart', group: 'biz' },
      { id: 'p6', num: '06', name: 'Pessoas e Capacitação', short: 'Pessoas', color: '#E0952B', icon: 'users', group: 'gov' },
      { id: 'p7', num: '07', name: 'Financeiro e Fornecedores (FinOps)', short: 'FinOps', color: '#0D9488', icon: 'dollar', group: 'biz' },
      { id: 'p8', num: '08', name: 'Inovação, IA e BPO', short: 'Inovação & IA', color: '#EC4899', icon: 'cpu', group: 'biz' }
    ];

    console.log('🌱 A verificar/inicializar Macro Pilares e Configurações...');
    
    // Seed Demand Types se não existir
    const existingDemandTypes = await prisma.appSettings.findUnique({ where: { key: 'demand_types' } });
    if (!existingDemandTypes) {
      await prisma.appSettings.create({
        data: {
          key: 'demand_types',
          value: JSON.stringify(['Política PSI', 'SAM / Licenciamento', 'Catálogo ITIL', 'Treinamento', 'Onboarding'])
        }
      });
    }

    const countPillars = await prisma.macroPillar.count();
    if (countPillars === 0) {
      for (const p of PILLARS) {
        await prisma.macroPillar.upsert({
          where: { id: p.id },
          update: { num: p.num, name: p.name, short: p.short, color: p.color, icon: p.icon, group: p.group },
          create: p,
        });
      }
    }

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor EcoIT a correr em http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Falha ao arrancar o servidor:', err);
    process.exit(1);
  }
}

bootstrap();
