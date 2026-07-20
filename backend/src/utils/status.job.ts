import cron from 'node-cron';
import ping from 'ping';
import { nodeService } from '../services/node.service';

export const startStatusJob = () => {
  // Executar a cada 1 minuto (Ajustável)
  cron.schedule('*/1 * * * *', async () => {
    console.log('🔄 [Status Job] Iniciando verificação de IPs...');
    
    try {
      const nodes = await nodeService.getAllNodes();
      
      for (const node of nodes) {
        let meta;
        try {
          meta = JSON.parse(node.metadata);
        } catch (e) {
          continue; // Ignora se o JSON for inválido
        }

        // Se o nó tiver um IP definido
        if (meta.ip && typeof meta.ip === 'string' && meta.ip.trim() !== '') {
          // Dispara um ICMP ping
          const res = await ping.promise.probe(meta.ip, {
            timeout: 2 // 2 segundos de limite
          });

          const newStatus = res.alive ? 'online' : 'offline';

          // Apenas atualiza a base de dados se houver mudança de estado
          if (meta.status !== newStatus) {
            meta.status = newStatus;
            
            await nodeService.updateNode(node.id, {
              metadata: JSON.stringify(meta)
            });
            
            console.log(`✅ [Status Job] Nó "${node.name}" (${meta.ip}) mudou para: ${newStatus.toUpperCase()}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ [Status Job] Erro ao executar verificação:', error);
    }
  });

  console.log('⏱️ [Status Job] Worker de Observabilidade iniciado com sucesso.');
};
