import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('ADMIN'), (req, res) => {
  res.json({ message: 'Rota de admin funcionando!' });
});

export default router;
