import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

// Usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listar);

// Produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.get("/produtos", produtoController.listar);
rotasAutenticadas.delete('/produtos/:id', produtoController.excluir);

// Carrinho
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listarItens); // <-- nova rota

export default rotasAutenticadas;
