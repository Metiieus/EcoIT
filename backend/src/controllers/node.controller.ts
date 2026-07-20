import { Request, Response } from 'express';
import { nodeService } from '../services/node.service';
import { encryptString } from '../utils/crypto';

// Ajuda a procurar e encriptar campos sensíveis antes de guardar na Base de Dados
const processMetadataForSave = (metadata: any, oldMetadata?: any) => {
  if (!metadata || typeof metadata !== 'object') return metadata;
  const newMeta = { ...metadata };
  
  for (const key in newMeta) {
    // Se a chave começar por 'secret_', tratamos como sensível
    if (key.startsWith('secret_')) {
      const val = newMeta[key];
      if (val === '******') {
        // O utilizador não alterou a password mascarada, vamos restaurar a encriptada antiga
        if (oldMetadata && oldMetadata[key]) {
          newMeta[key] = oldMetadata[key];
        } else {
          delete newMeta[key];
        }
      } else if (val) {
        // Novo segredo introduzido -> Encriptar (AES-256-GCM)
        newMeta[key] = encryptString(val.toString());
      }
    }
  }
  return newMeta;
};

// Ajuda a mascarar campos sensíveis antes de enviar para o Frontend (React Flow)
const maskMetadataForClient = (metadata: any) => {
  if (!metadata || typeof metadata !== 'object') return metadata;
  const newMeta = { ...metadata };
  
  for (const key in newMeta) {
    if (key.startsWith('secret_')) {
      // Mascaramos o valor real para não transitar na rede nem aparecer no ecrã
      newMeta[key] = newMeta[key] ? '******' : '';
    }
  }
  return newMeta;
};

export class NodeController {
  async getAll(req: Request, res: Response) {
    try {
      const nodes = await nodeService.getAllNodes();
      // Parse do metadata e aplica máscara aos segredos
      const safeNodes = nodes.map(node => {
        const meta = JSON.parse(node.metadata);
        return {
          ...node,
          metadata: maskMetadataForClient(meta)
        };
      });
      res.json(safeNodes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar os nós' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const node = await nodeService.getNodeById(req.params.id);
      if (node) {
        const meta = JSON.parse(node.metadata);
        res.json({
          ...node,
          metadata: maskMetadataForClient(meta)
        });
      } else {
        res.status(404).json({ error: 'Nó não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar o nó' });
    }
  }

  async getSecret(req: Request, res: Response) {
    try {
      const { id, key } = req.params;
      
      if (!key.startsWith('secret_')) {
        return res.status(400).json({ error: 'Apenas chaves de segredo podem ser reveladas' });
      }

      const node = await nodeService.getNodeById(id);
      if (!node) {
        return res.status(404).json({ error: 'Nó não encontrado' });
      }

      const meta = JSON.parse(node.metadata);
      const encryptedValue = meta[key];

      if (!encryptedValue) {
        return res.status(404).json({ error: 'Segredo não encontrado' });
      }

      const decrypted = decryptString(encryptedValue);
      // Retorna em JSON para o front-end
      res.json({ [key]: decrypted });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao revelar segredo' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { metadata, ...rest } = req.body;
      
      let finalMetadata = metadata || {};
      if (typeof metadata === 'object') {
        finalMetadata = processMetadataForSave(metadata);
      }

      const dataToSave = {
        ...rest,
        metadata: JSON.stringify(finalMetadata)
      };
      
      const node = await nodeService.createNode(dataToSave);
      res.status(201).json({
        ...node,
        metadata: maskMetadataForClient(JSON.parse(node.metadata))
      });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar o nó' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      // Buscar o nó antigo para recuperar segredos caso o utilizador submeta '******'
      const oldNode = await nodeService.getNodeById(req.params.id);
      let oldMetadata = {};
      if (oldNode) oldMetadata = JSON.parse(oldNode.metadata);

      const { metadata, ...rest } = req.body;
      
      let finalMetadata = metadata;
      if (metadata !== undefined && typeof metadata === 'object') {
         finalMetadata = processMetadataForSave(metadata, oldMetadata);
      }

      const dataToSave = {
        ...rest,
        ...(finalMetadata !== undefined && { metadata: JSON.stringify(finalMetadata) })
      };
      
      const node = await nodeService.updateNode(req.params.id, dataToSave);
      res.json({
        ...node,
        metadata: maskMetadataForClient(JSON.parse(node.metadata))
      });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar o nó' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await nodeService.deleteNode(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao apagar o nó' });
    }
  }
}

export const nodeController = new NodeController();
