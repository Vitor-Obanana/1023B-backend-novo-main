import { Request, Response } from "express";
import { ObjectId } from "bson";
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
    usuarioId?: string
}

class CarrinhoController {

    // ADICIONAR ITEM
    async adicionarItem(req: RequestAuth, res: Response) {
        const { produtoId, quantidade } = req.body;
        const usuarioId = req.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensagem: "Token não foi passado" });

        const produto = await db.collection<Produto>('produtos').findOne({ _id: ObjectId.createFromHexString(produtoId) });
        if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado' });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });

        if (!carrinho) {
            const novoCarrinho: Carrinho = {
                usuarioId,
                itens: [{ produtoId, quantidade, precoUnitario: produto.preco, nome: produto.nome }],
                dataAtualizacao: new Date(),
                total: produto.preco * quantidade
            };
            const resposta = await db.collection<Carrinho>("carrinhos").insertOne(novoCarrinho);
            return res.status(201).json({ ...novoCarrinho, _id: resposta.insertedId });
        }

        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            carrinho.itens.push({ produtoId, quantidade, precoUnitario: produto.preco, nome: produto.nome });
        }

        carrinho.total = carrinho.itens.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);
        carrinho.dataAtualizacao = new Date();

        await db.collection<Carrinho>("carrinhos").updateOne({ usuarioId }, {
            $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao }
        });

        res.status(200).json(carrinho);
    }

    // REMOVER ITEM
    async removerItem(req: RequestAuth, res: Response) {
        const { produtoId } = req.body;
        const usuarioId = req.usuarioId;

        if (!usuarioId) return res.status(401).json({ mensagem: "Token não foi passado para remover do carrinho" });
        if (!produtoId) return res.status(400).json({ mensagem: "produtoId é obrigatório" });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho) return res.status(404).json({ mensagem: "Carrinho não encontrado" });

        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if (!itemExistente) return res.status(404).json({ mensagem: "Item não encontrado no carrinho" });

        const itensAtualizados = carrinho.itens.filter(item => item.produtoId !== produtoId);
        const totalAtualizado = itensAtualizados.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);

        await db.collection<Carrinho>("carrinhos").updateOne(
            { usuarioId },
            { $set: { itens: itensAtualizados, total: totalAtualizado, dataAtualizacao: new Date() } }
        );

        res.status(200).json({ usuarioId, itens: itensAtualizados, total: totalAtualizado, dataAtualizacao: new Date() });
    }

    // LISTAR ITENS DO CARRINHO
    async listarItens(req: RequestAuth, res: Response) {
        const usuarioId = req.usuarioId;
        if (!usuarioId) return res.status(401).json({ mensagem: "Token não foi passado" });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        res.status(200).json(carrinho || { itens: [], total: 0 });
    }
}

export default new CarrinhoController();