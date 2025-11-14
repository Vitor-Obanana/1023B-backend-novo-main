import { Router } from "express";
import Auth from "../middleware/auth.js";
import AdminAuth from "../middleware/adminAuth.js";

// IMPORTS — remover .js porque você está usando TypeScript
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import usuarioController from "../usuarios/usuario.controller.js";

const rotasAutenticadas = Router();

// Middleware — TODAS as rotas abaixo exigem login
rotasAutenticadas.use(Auth);

// -------------------------------------------------------
// PRODUTOS (ADMIN)
// -------------------------------------------------------
rotasAutenticadas.post("/produtos", AdminAuth, produtoController.adicionar);
rotasAutenticadas.delete("/produtos/:id", AdminAuth, produtoController.excluir);

// -------------------------------------------------------
// CARRINHO
// -------------------------------------------------------
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listarItens);

// ALTERAR QUANTIDADE
rotasAutenticadas.put("/alterarQuantidade", carrinhoController.alterarQuantidade);

// -------------------------------------------------------
// ADMIN – LISTAR USUÁRIOS
// -------------------------------------------------------
rotasAutenticadas.get(
  "/admin/usuarios",
  AdminAuth,
  usuarioController.listarApenasAdmins
);

// -------------------------------------------------------
// LISTAR PRODUTOS (QUALQUER USUÁRIO AUTENTICADO)
// -------------------------------------------------------
rotasAutenticadas.get("/produtos", produtoController.listar);

export default rotasAutenticadas;
