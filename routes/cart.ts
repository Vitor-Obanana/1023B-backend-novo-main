import express from "express";
const { authenticateToken } = require("../middleware/auth");
const Chart = require("../pages/Chart");

interface AuthenticatedRequest extends express.Request {
  user: {
    sub: string;
    role: string;
  };
}

const router = express.Router();

// Excluir carrinho inteiro — dono pode excluir, ADMIN também
router.delete("/:chartId", authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { chartId } = req.params;
    const authenticatedReq = req as AuthenticatedRequest;
    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    // Verifica se o usuário é o dono do carrinho ou um ADMIN
    if (chart.userId.toString() !== authenticatedReq.user.sub && authenticatedReq.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Você não tem permissão para excluir este carrinho" });
    }

    await Chart.findByIdAndDelete(chartId);
    return res.json({ message: "Carrinho excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir carrinho:", err);
    return res.status(500).json({ message: "Erro ao excluir carrinho" });
  }
});

// Excluir todos os carrinhos do usuário autenticado
router.delete("/", authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    await Chart.deleteMany({ userId: authenticatedReq.user.sub });
    return res.json({ message: "Todos os carrinhos do usuário foram excluídos" });
  } catch (err) {
    console.error("Erro ao excluir carrinhos:", err);
    return res.status(500).json({ message: "Erro ao excluir carrinhos" });
  }
});

// Atualizar quantidade de um item dentro do carrinho
router.put("/:id", authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;

    // Validação para garantir que a quantidade seja um número válido
    if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      return res.status(400).json({ message: "Quantidade inválida" });
    }

    const carrinhoAtualizado = await Chart.findOneAndUpdate(
      { "itens._id": id },
      { $set: { "itens.$.quantidade": Number(quantidade) } },
      { new: true }
    );

    if (!carrinhoAtualizado) {
      return res.status(404).json({ message: "Item não encontrado no carrinho" });
    }

    return res.json(carrinhoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);
    return res.status(500).json({ message: "Erro ao atualizar quantidade" });
  }
});

export default router;