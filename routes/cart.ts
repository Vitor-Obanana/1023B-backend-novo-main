// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Excluir carrinho inteiro - permitimos que o dono exclua, ou ADMIN exclui qualquer
router.delete('/:cartId', authenticateToken, async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: 'Carrinho não encontrado' });

    if (cart.userId.toString() !== req.user.sub && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Você não pode excluir este carrinho' });
    }

    await Cart.findByIdAndDelete(cartId);
    return res.json({ message: 'Carrinho excluído com sucesso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao excluir carrinho' });
  }
});

// Opcional: endpoint para excluir carrinho do usuário autenticado sem passar cartId
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user.sub }); // apaga todos os carrinhos do usuário (caso haja)
    return res.json({ message: 'Todos os carrinhos do usuário excluídos' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao excluir carrinhos' });
  }
});

const router = express.Router();

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;

    const carrinho = await Carrinho.findOneAndUpdate(
      { "itens._id": id },
      { $set: { "itens.$.quantidade": quantidade } },
      { new: true }
    );

    if (!carrinho) return res.status(404).json({ mensagem: "Item não encontrado" });
    res.json(carrinho);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar quantidade" });
  }
});

module.exports = router;
