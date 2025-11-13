// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'troco_pra_producao';

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

    // token payload inclui role e nome
    const payload = { sub: user._id, name: user.name, role: user.role, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    return res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota para criar usuário (somente ADMIN pode criar outros ADMINs; para testes pode deixar pública ou proteger)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, role: role || 'USER' });
    await user.save();
    return res.status(201).json({ message: 'Usuário criado', user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: 'Erro ao criar usuário', error: err.message });
  }
});

module.exports = router;
