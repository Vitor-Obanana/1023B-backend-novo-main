import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

// 🔐 Aplica o middleware de autenticação em TODAS as rotas
rotasAutenticadas.use(authenticateToken);

// Produtos (somente admin)
rotasAutenticadas.post("/produtos", requireRole("ADMIN"), produtoController.adicionar);
rotasAutenticadas.delete("/produtos/:id", requireRole("ADMIN"), produtoController.excluir);
rotasAutenticadas.put("/produtos/:id", requireRole("ADMIN"), produtoController.atualizar);

// Carrinho (qualquer usuário logado)
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listarItens);

export default rotasAutenticadas;

