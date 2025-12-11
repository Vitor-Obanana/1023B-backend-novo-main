import { Router } from "express";
import Auth from "../middleware/auth.js";
import AdminAuth from "../middleware/adminAuth.js";

// IMPORTS dos controllers
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import usuarioController from "../usuarios/usuario.controller.js";
import pagamentoController from "../pagamento/pagamento.controller.js";

const rotasAutenticadas = Router();

// -----------------------------------------------------------------------------
// TODAS AS ROTAS ABAIXO EXIGEM LOGIN (Auth)
// -----------------------------------------------------------------------------
rotasAutenticadas.use(Auth);

// -----------------------------------------------------------------------------
// PAGAMENTO (STRIPE)
// -----------------------------------------------------------------------------
rotasAutenticadas.post("/checkout", pagamentoController.criarPagamentoCartao);

// -----------------------------------------------------------------------------
// PRODUTOS — somente ADMIN pode criar e excluir
// -----------------------------------------------------------------------------
rotasAutenticadas.post("/produtos", AdminAuth, produtoController.adicionar);
rotasAutenticadas.delete("/produtos/:id", AdminAuth, produtoController.excluir);

// -----------------------------------------------------------------------------
// LISTAR PRODUTOS — qualquer usuário autenticado pode acessar
// -----------------------------------------------------------------------------
rotasAutenticadas.get("/produtos", produtoController.listar);

// -----------------------------------------------------------------------------
// CARRINHO — qualquer usuário autenticado pode usar
// -----------------------------------------------------------------------------
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listarItens);
rotasAutenticadas.put("/alterarQuantidade", carrinhoController.alterarQuantidade);
rotasAutenticadas.delete("/limparCarrinho", carrinhoController.limparCarrinho);
rotasAutenticadas.get("/admin/usuarios",AdminAuth,usuarioController.listarApenasAdmins);

export default rotasAutenticadas;