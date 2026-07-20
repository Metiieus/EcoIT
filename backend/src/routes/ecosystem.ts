import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/ecosystem/graph
router.get('/ecosystem/graph', async (req, res) => {
  try {
    const pillars = await prisma.macroPillar.findMany();
    const nodes = await prisma.ecosystemNode.findMany({
      include: {
        _count: {
          select: { vaults: true }
        }
      }
    });
    const edges = await prisma.topologyEdge.findMany();

    // Parse metadata to object for the frontend
    const parsedNodes = nodes.map(node => {
      let parsedMetadata = {};
      try {
        parsedMetadata = JSON.parse(node.metadata);
      } catch (e) {}
      
      const { _count, ...rest } = node;
      return {
        ...rest,
        metadata: parsedMetadata,
        vaultCount: _count.vaults
      };
    });

    res.json({
      pillars,
      nodes: parsedNodes,
      edges
    });
  } catch (error) {
    console.error('Error fetching graph:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/nodes
router.post('/nodes', async (req, res) => {
  try {
    const { name, pillarId, group, metadata, positionX, positionY, notes } = req.body;
    
    const newNode = await prisma.ecosystemNode.create({
      data: {
        name,
        pillarId,
        group,
        positionX: positionX || 100.0,
        positionY: positionY || 100.0,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
        notes: notes || null
      }
    });

    // We no longer save 'auto' edges to the DB because of FK constraints (sourceId is a Pillar, but TopologyEdge expects EcosystemNode).
    // The frontend will automatically generate an edge from the pillarId.
    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(newNode.metadata);
    } catch (e) {}

    res.status(201).json({
      node: { ...newNode, metadata: parsedMetadata },
      edge: { id: 'a' + newNode.id, sourceId: pillarId, targetId: newNode.id, kind: 'auto' }
    });
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: 'Failed to create node' });
  }
});

// PUT /api/nodes/:id
router.put('/nodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pillarId, group, metadata, notes } = req.body;
    
    // We update fields that are provided
    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (pillarId !== undefined) dataToUpdate.pillarId = pillarId;
    if (group !== undefined) dataToUpdate.group = group;
    if (metadata !== undefined) dataToUpdate.metadata = JSON.stringify(metadata);
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updatedNode = await prisma.ecosystemNode.update({
      where: { id },
      data: dataToUpdate
    });

    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(updatedNode.metadata);
    } catch (e) {}

    res.json({ ...updatedNode, metadata: parsedMetadata });
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// PATCH /api/nodes/:id/position
router.patch('/nodes/:id/position', async (req, res) => {
  try {
    const { id } = req.params;
    const { positionX, positionY } = req.body;
    
    await prisma.ecosystemNode.update({
      where: { id },
      data: { positionX, positionY },
      select: { id: true } // optimize the return since frontend already has the position
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error updating node position:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
});

// DELETE /api/nodes/:id
router.delete('/nodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Cascade delete happens automatically due to prisma schema relations (`onDelete: Cascade`)
    await prisma.ecosystemNode.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// POST /api/edges
router.post('/edges', async (req, res) => {
  try {
    const { sourceId, targetId, kind } = req.body;
    
    // Evitar arestas duplicadas (mesmo par source/target, independente da ordem na interface)
    const existingEdge = await prisma.topologyEdge.findFirst({
      where: {
        OR: [
          { sourceId, targetId },
          { sourceId: targetId, targetId: sourceId }
        ]
      }
    });

    if (existingEdge) {
      return res.status(409).json({ error: 'Conexão já existe entre estes itens.' });
    }

    const edge = await prisma.topologyEdge.create({
      data: {
        sourceId,
        targetId,
        kind: kind || 'manual'
      }
    });
    res.status(201).json(edge);
  } catch (error) {
    console.error('Error creating edge:', error);
    res.status(500).json({ error: 'Failed to create edge' });
  }
});

// DELETE /api/edges/:id
router.delete('/edges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.topologyEdge.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting edge:', error);
    res.status(500).json({ error: 'Failed to delete edge' });
  }
});

// GET /api/ecosystem/export
router.get('/ecosystem/export', async (req, res) => {
  try {
    const pillars = await prisma.macroPillar.findMany();
    const nodes = await prisma.ecosystemNode.findMany();
    const edges = await prisma.topologyEdge.findMany();
    const vaults = await prisma.secretVault.findMany({
      select: { id: true, nodeId: true, usernameOrToken: true, createdAt: true }
    });

    const exportData = { pillars, nodes, edges, vaults, exportedAt: new Date().toISOString() };
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting graph:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- SETTINGS API ---
router.get('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await prisma.appSettings.findUnique({ where: { key } });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await prisma.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- PILLARS API ---
router.post('/pillars', async (req, res) => {
  try {
    const { id, num, name, short, color, icon, group } = req.body;
    const pillar = await prisma.macroPillar.create({
      data: { id, num, name, short, color, icon, group }
    });
    res.status(201).json(pillar);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pillar' });
  }
});

router.put('/pillars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { num, name, short, color, icon, group } = req.body;
    const pillar = await prisma.macroPillar.update({
      where: { id },
      data: { num, name, short, color, icon, group }
    });
    res.json(pillar);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pillar' });
  }
});

router.delete('/pillars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.macroPillar.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pillar' });
  }
});

export default router;
