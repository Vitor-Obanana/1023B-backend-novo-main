import { Router } from "express";
import Auth from "../middleware/auth.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

// Aplica o middleware Auth em todas
rotasAutenticadas.use(Auth);

// Produtos (somente admin)
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.delete("/produtos/:id", produtoController.excluir);

// Carrinho
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listarItens);

export default rotasAutenticadas;


