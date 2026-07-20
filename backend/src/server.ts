import express from 'express';
import cors from 'cors';
import nodeRoutes from './routes/node.routes';
import edgeRoutes from './routes/edge.routes';
import { startStatusJob } from './utils/status.job';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/edges', edgeRoutes);

// Iniciar Observabilidade
startStatusJob();

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
