import { Request, Response } from 'express';
import { edgeService } from '../services/edge.service';

export class EdgeController {
  async getAll(req: Request, res: Response) {
    try {
      const edges = await edgeService.getAllEdges();
      res.json(edges);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar as conexões' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const edge = await edgeService.createEdge(req.body);
      res.status(201).json(edge);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar a conexão' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await edgeService.deleteEdge(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao apagar a conexão' });
    }
  }
}

export const edgeController = new EdgeController();
