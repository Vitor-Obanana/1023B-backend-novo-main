import express from 'express';
import { isAdmin } from '../middleware/auth.js';
const router = express.Router();

router.get('/', isAdmin, (req, res) => {
  res.json({ message: 'Rota de admin funcionando!' });
});

export default router;