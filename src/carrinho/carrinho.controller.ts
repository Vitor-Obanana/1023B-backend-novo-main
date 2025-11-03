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
    nome:string,
    preco:number,
    descricao:string,
    urlfoto:string
}
interface RequestAuth extends Request{
    usuarioId?:string
} 

class CarrinhoController {
    //adicionarItem
    async adicionarItem(req:RequestAuth, res:Response) {
        const { produtoId, quantidade } = req.body as {usuarioId: string, produtoId: string, quantidade: number};
        const usuarioId = req.usuarioId
        if(!usuarioId)
            return res.status(401).json({mensagem:"Token não foi passado para adicionar no carrinho"})

        //Buscar o produto no banco de dados
        const produto = await db.collection<Produto>('produtos')
                        .findOne({ _id: ObjectId.createFromHexString(produtoId)});
        if(!produto)
            return res.status(404).json({mensagem: 'Produto não encontrado'});
        //Pegar o preço do produto
        //Pegar o nome do produto
        const nomeProduto = produto.nome;
        const precoProduto = produto.preco;
        
        // Verificar se um carrinho com o usuário já existe
        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({usuarioId: usuarioId});

        if(!carrinho){
            const novoCarrinho: Carrinho = {
                usuarioId: usuarioId,
                itens: [{
                    produtoId: produtoId,
                    quantidade: quantidade,
                    precoUnitario: precoProduto,
                    nome: nomeProduto
                }],
                dataAtualizacao: new Date(),
                total: precoProduto * quantidade
            }
            const resposta = await db.collection<Carrinho>("carrinhos").insertOne(novoCarrinho);
            const carrinhoResposta = {
                usuarioId: novoCarrinho.usuarioId,
                itens: novoCarrinho.itens,
                dataAtualizacao: novoCarrinho.dataAtualizacao,
                total: novoCarrinho.total,
                _id: resposta.insertedId
                
            }
            //return res.status(201).json({...novoCarrinho, _id: resposta.insertedId});

            //Early Return
            return res.status(201).json(carrinhoResposta);

        }
        //ELSE
        // Se existir, deve adicionar o item ao carrinho existente
        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if(itemExistente){
            itemExistente.quantidade += quantidade;
            carrinho.total += precoProduto * quantidade;
            carrinho.dataAtualizacao = new Date();
        }
        else{
            carrinho.itens.push({
                produtoId: produtoId,
                quantidade: quantidade,
                precoUnitario: precoProduto,
                nome: nomeProduto
            });
            carrinho.total += precoProduto * quantidade;
            carrinho.dataAtualizacao = new Date();
        }
        // Atualizar o carrinho no banco de dados
        await db.collection<Carrinho>("carrinhos").updateOne({usuarioId: usuarioId},
            {$set: {
                itens: carrinho.itens, 
                total: carrinho.total, 
                dataAtualizacao: carrinho.dataAtualizacao
            }
            }
        )
        res.status(200).json(carrinho);
    }
    async removerItem(req:Request, res:Response) {
        const { produtoId , usuarioId } = req.body;
        //Faça o removerItem
        //Do melhor jeito

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({usuarioId: usuarioId});
        if(!carrinho){
            return res.status(404).json({mensagem: 'Carrinho não encontrado'});
        }
        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if(!itemExistente){
            return res.status(404).json({mensagem: 'Item não encontrado'});
        }
        const filtrados = carrinho.itens.filter(item => item.produtoId !== produtoId);
        const total = filtrados.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);
        const carrinhoAtualizado = {
            usuarioId: carrinho.usuarioId,
            itens: filtrados,
            dataAtualizacao: new Date(),
            total: total
        }
        await db.collection<Carrinho>("carrinhos").updateOne({usuarioId: usuarioId},
            {$set: {
                itens: carrinhoAtualizado.itens, 
                total: carrinhoAtualizado.total, 
                dataAtualizacao: carrinhoAtualizado.dataAtualizacao
            }
            }
        )
        return res.status(200).json(carrinhoAtualizado);

    }
    async atualizarQuantidade(req:Request, res:Response) {
        const { produtoId , usuarioId, quantidade  } = req.body;
        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({usuarioId: usuarioId});
        if(!carrinho){
            return res.status(404).json({mensagem: 'Carrinho não encontrado'});
        }
        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if(!itemExistente){
            return res.status(404).json({mensagem: 'Item não encontrado'});
        }
        itemExistente.quantidade = quantidade;
        carrinho.total = carrinho.itens.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);
        carrinho.dataAtualizacao = new Date();
        await db.collection<Carrinho>("carrinhos").updateOne({usuarioId: usuarioId},
            {$set: {
                itens: carrinho.itens, 
                total: carrinho.total, 
                dataAtualizacao: carrinho.dataAtualizacao
            }
            }
        )
        return res.status(200).json(carrinho);
    }
    async listar(req:Request, res:Response) {
        const { usuarioId } = req.body;
        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({usuarioId: usuarioId});
        if(!carrinho){
            return res.status(404).json({mensagem: 'Carrinho não encontrado'});
        }
        return res.status(200).json(carrinho);
    }
    async remover(req:Request, res:Response) {
        const { usuarioId } = req.body;
        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({usuarioId: usuarioId});
        if(!carrinho){
            return res.status(404).json({mensagem: 'Carrinho não encontrado'});
        }
        await db.collection<Carrinho>("carrinhos").deleteOne({usuarioId: usuarioId});
        return res.status(200).json({mensagem: 'Carrinho removido com sucesso'});
    }

}
export default new CarrinhoController();