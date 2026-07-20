import { PrismaClient, TopologyEdge } from '@prisma/client';

const prisma = new PrismaClient();

export class EdgeService {
  async getAllEdges(): Promise<TopologyEdge[]> {
    return prisma.topologyEdge.findMany();
  }

  async createEdge(data: Omit<TopologyEdge, 'id'>): Promise<TopologyEdge> {
    return prisma.topologyEdge.create({ data });
  }

  async deleteEdge(id: string): Promise<TopologyEdge> {
    return prisma.topologyEdge.delete({ where: { id } });
  }
}

export const edgeService = new EdgeService();
