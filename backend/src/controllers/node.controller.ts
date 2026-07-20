import { Request, Response } from 'express';
import { nodeService } from '../services/node.service';

export class NodeController {
  async getAll(req: Request, res: Response) {
    try {
      const nodes = await nodeService.getAllNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar os nodes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const node = await nodeService.getNodeById(req.params.id);
      if (node) {
        res.json(node);
      } else {
        res.status(404).json({ error: 'Node não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar o node' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const node = await nodeService.createNode(req.body);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar o node' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const node = await nodeService.updateNode(req.params.id, req.body);
      res.json(node);
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
