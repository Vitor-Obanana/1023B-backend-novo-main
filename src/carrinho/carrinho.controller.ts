import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../database/banco-mongo.js";

interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  nome: string;
}

interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
  dataAtualizacao: Date;
  total: number;
}

interface Produto {
  _id: ObjectId;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
}

interface RequestAuth extends Request {
  usuarioId?: string;
}

class CarrinhoController {
  // ➕ ADICIONAR ITEM AO CARRINHO
  async adicionarItem(req: RequestAuth, res: Response) {
    try {
      const { produtoId, quantidade } = req.body;
      const usuarioId = req.usuarioId;

      if (!usuarioId)
        return res.status(401).json({ mensagem: "Token não foi passado" });

      if (!produtoId || !quantidade)
        return res.status(400).json({ mensagem: "produtoId e quantidade são obrigatórios" });

      const produto = await db
        .collection<Produto>("produtos")
        .findOne({ _id: new ObjectId(produtoId) });

      if (!produto)
        return res.status(404).json({ mensagem: "Produto não encontrado" });

      const carrinhosCollection = db.collection<Carrinho>("carrinhos");
      const carrinho = await carrinhosCollection.findOne({ usuarioId });

      // 🛒 Se o usuário ainda não tiver carrinho, cria um novo
      if (!carrinho) {
        const novoCarrinho: Carrinho = {
          usuarioId,
          itens: [
            {
              produtoId,
              quantidade,
              precoUnitario: produto.preco,
              nome: produto.nome,
            },
          ],
          dataAtualizacao: new Date(),
          total: produto.preco * quantidade,
        };

        const resposta = await carrinhosCollection.insertOne(novoCarrinho);
        return res.status(201).json({ ...novoCarrinho, _id: resposta.insertedId });
      }

      // 🧾 Atualiza o carrinho existente
      const itemExistente = carrinho.itens.find(
        (item) => item.produtoId === produtoId
      );

      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        carrinho.itens.push({
          produtoId,
          quantidade,
          precoUnitario: produto.preco,
          nome: produto.nome,
        });
      }

      carrinho.total = carrinho.itens.reduce(
        (total, item) => total + item.precoUnitario * item.quantidade,
        0
      );
      carrinho.dataAtualizacao = new Date();

      await carrinhosCollection.updateOne(
        { usuarioId },
        {
          $set: {
            itens: carrinho.itens,
            total: carrinho.total,
            dataAtualizacao: carrinho.dataAtualizacao,
          },
        }
      );

      return res.status(200).json(carrinho);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      return res.status(500).json({ mensagem: "Erro ao adicionar item no carrinho" });
    }
  }

  // ❌ REMOVER ITEM DO CARRINHO
  async removerItem(req: RequestAuth, res: Response) {
    try {
      const { produtoId } = req.body;
      const usuarioId = req.usuarioId;

      if (!usuarioId)
        return res.status(401).json({ mensagem: "Token não foi passado" });
      if (!produtoId)
        return res.status(400).json({ mensagem: "produtoId é obrigatório" });

      const carrinhosCollection = db.collection<Carrinho>("carrinhos");
      const carrinho = await carrinhosCollection.findOne({ usuarioId });

      if (!carrinho)
        return res.status(404).json({ mensagem: "Carrinho não encontrado" });

      const itensAtualizados = carrinho.itens.filter(
        (item) => item.produtoId !== produtoId
      );

      const totalAtualizado = itensAtualizados.reduce(
        (total, item) => total + item.precoUnitario * item.quantidade,
        0
      );

      await carrinhosCollection.updateOne(
        { usuarioId },
        {
          $set: {
            itens: itensAtualizados,
            total: totalAtualizado,
            dataAtualizacao: new Date(),
          },
        }
      );

      return res
        .status(200)
        .json({ usuarioId, itens: itensAtualizados, total: totalAtualizado });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      return res.status(500).json({ mensagem: "Erro ao remover item do carrinho" });
    }
  }

  // 📋 LISTAR ITENS DO CARRINHO
  async listarItens(req: RequestAuth, res: Response) {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId)
        return res.status(401).json({ mensagem: "Token não foi passado" });

      const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
      return res.status(200).json(carrinho || { itens: [], total: 0 });
    } catch (error) {
      console.error("Erro ao listar carrinho:", error);
      return res.status(500).json({ mensagem: "Erro ao listar carrinho" });
    }
  }

  // 🔎 LISTAR COM FILTROS
  async listar(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const { nome, precoMin, precoMax, quantidade } = req.query;

      const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioAdmin: usuarioId });
      if (!carrinho)
        return res.status(404).json({ mensagem: "Carrinho não encontrado 😢" });

      let itensFiltrados = carrinho.itens;

      if (nome)
        itensFiltrados = itensFiltrados.filter((i) =>
          i.nome.toLowerCase().includes((nome as string).toLowerCase())
        );
      if (quantidade)
        itensFiltrados = itensFiltrados.filter((i) => i.quantidade === Number(quantidade));
      if (precoMin)
        itensFiltrados = itensFiltrados.filter((i) => i.precoUnitario >= Number(precoMin));
      if (precoMax)
        itensFiltrados = itensFiltrados.filter((i) => i.precoUnitario <= Number(precoMax));

      const total = itensFiltrados.reduce(
        (acc, item) => acc + item.precoUnitario * item.quantidade,
        0
      );

      return res.status(200).json({ ...carrinho, itens: itensFiltrados, total });
    } catch (error) {
      console.error("Erro ao filtrar carrinho:", error);
      return res.status(500).json({ mensagem: "Erro ao listar carrinho 😞" });
    }
  }
}

export default new CarrinhoController();
