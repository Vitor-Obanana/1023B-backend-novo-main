import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';
import { ObjectId } from 'bson';

class ProdutoController {
    async adicionar(req: Request, res: Response) {
        const { nome, preco, descricao, urlfoto } = req.body;
        const produto = { nome, preco, descricao, urlfoto };
        const resposta = await db.collection('produtos').insertOne(produto);
        res.status(201).json({ ...produto, _id: resposta.insertedId });
    }

    async listar(req: Request, res: Response) {
        const produtos = await db.collection('produtos').find().toArray();
        res.status(200).json(produtos);
    }

    async excluir(req: Request, res: Response) {
        try {
            const produtoId = req.params.id;
            const tipoUsuario = req.headers['tipousuario']; // ou pegar do token JWT

            if (tipoUsuario !== 'admin') {
                return res.status(403).json({ mensagem: "Acesso negado. Apenas admin pode excluir produtos." });
            }

            const resultado = await db.collection('produtos').deleteOne({ _id: new ObjectId(produtoId) });

            if (resultado.deletedCount === 0) {
                return res.status(404).json({ mensagem: "Produto não encontrado." });
            }

            res.status(200).json({ mensagem: "Produto excluído com sucesso!" });
        } catch (error: any) {
            res.status(500).json({ mensagem: error.message });
        }
    }
}

export default new ProdutoController();
