import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '../utils/crypto';

const router = Router();
const prisma = new PrismaClient();

// POST /api/vault/save
router.post('/save', async (req, res) => {
  try {
    const { nodeId, usernameOrToken, plainPassword } = req.body;

    if (!nodeId || !plainPassword) {
      return res.status(400).json({ error: 'nodeId and plainPassword are required' });
    }

    const { encryptedPassword, iv, authTag } = CryptoUtils.encrypt(plainPassword);

    const vaultEntry = await prisma.secretVault.create({
      data: {
        nodeId,
        usernameOrToken: usernameOrToken || null,
        encryptedPassword,
        iv,
        authTag
      }
    });

    res.status(201).json({
      id: vaultEntry.id,
      nodeId: vaultEntry.nodeId,
      usernameOrToken: vaultEntry.usernameOrToken,
      createdAt: vaultEntry.createdAt
      // Do not return encryptedPassword, iv, or authTag for security best practices
    });
  } catch (error) {
    console.error('Error saving secret:', error);
    res.status(500).json({ error: 'Failed to save secret' });
  }
});

// POST /api/vault/reveal
router.post('/reveal', async (req, res) => {
  try {
    const { vaultId } = req.body;

    if (!vaultId) {
      return res.status(400).json({ error: 'vaultId is required' });
    }

    const vaultEntry = await prisma.secretVault.findUnique({
      where: { id: vaultId }
    });

    if (!vaultEntry) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    const plainPassword = CryptoUtils.decrypt(
      vaultEntry.encryptedPassword,
      vaultEntry.iv,
      vaultEntry.authTag
    );

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ plainPassword });
  } catch (error) {
    console.error('Error revealing secret:', error);
    res.status(500).json({ error: 'Failed to reveal secret' });
  }
});

// GET /api/vault/node/:nodeId
router.get('/node/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    const vaults = await prisma.secretVault.findMany({
      where: { nodeId },
      select: {
        id: true,
        usernameOrToken: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(vaults);
  } catch (error) {
    console.error('Error fetching node secrets:', error);
    res.status(500).json({ error: 'Failed to fetch node secrets' });
  }
});

// GET /api/vault/all
router.get('/all', async (req, res) => {
  try {
    const vaults = await prisma.secretVault.findMany({
      select: {
        id: true,
        usernameOrToken: true,
        createdAt: true,
        node: {
          select: { name: true, pillarId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(vaults);
  } catch (error) {
    console.error('Error fetching all secrets:', error);
    res.status(500).json({ error: 'Failed to fetch all secrets' });
  }
});

export default router;
