import { PrismaClient, Node } from '@prisma/client';

const prisma = new PrismaClient();

export class NodeService {
  async getAllNodes(): Promise<Node[]> {
    return prisma.node.findMany();
  }

  async getNodeById(id: string): Promise<Node | null> {
    return prisma.node.findUnique({ where: { id } });
  }

  async createNode(data: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>): Promise<Node> {
    return prisma.node.create({ data });
  }

  async updateNode(id: string, data: Partial<Omit<Node, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Node> {
    return prisma.node.update({
      where: { id },
      data,
    });
  }

  async deleteNode(id: string): Promise<Node> {
    return prisma.node.delete({ where: { id } });
  }
}

export const nodeService = new NodeService();
