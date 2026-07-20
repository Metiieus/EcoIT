import { Request, Response } from 'express';
import { nodeService } from '../services/node.service';

export class NodeController {
  async getAll(req: Request, res: Response) {
    try {
      const nodes = await nodeService.getAllNodes();
      const parsedNodes = nodes.map(node => ({
        ...node,
        metadata: JSON.parse(node.metadata)
      }));
      res.json(parsedNodes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar os nodes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const node = await nodeService.getNodeById(req.params.id);
      if (node) {
        res.json({
          ...node,
          metadata: JSON.parse(node.metadata)
        });
      } else {
        res.status(404).json({ error: 'Node não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar o node' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { metadata, ...rest } = req.body;
      const dataToSave = {
        ...rest,
        metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : (metadata || '{}')
      };
      const node = await nodeService.createNode(dataToSave);
      res.status(201).json({
        ...node,
        metadata: JSON.parse(node.metadata)
      });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar o node' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { metadata, ...rest } = req.body;
      const dataToSave = {
        ...rest,
        ...(metadata !== undefined && { metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata })
      };
      const node = await nodeService.updateNode(req.params.id, dataToSave);
      res.json({
        ...node,
        metadata: JSON.parse(node.metadata)
      });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar o node' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await nodeService.deleteNode(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao apagar o node' });
    }
  }
}

export const nodeController = new NodeController();
