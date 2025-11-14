import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

interface AlterarQuantidadeBody {
  produtoId: string;
  novaQuantidade: number;
}

export async function carrinhoRoutes(app: FastifyInstance) {
  app.put(
    "/alterarQuantidade",
    async (
      request: FastifyRequest<{ Body: AlterarQuantidadeBody }>,
      reply: FastifyReply
    ) => {

      const { produtoId, novaQuantidade } = request.body;

      if (!produtoId || typeof novaQuantidade !== "number") {
        return reply.status(400).send({
          mensagem: "Dados inválidos enviados.",
        });
      }

      if (novaQuantidade <= 0) {
        return reply.status(400).send({
          mensagem: "Quantidade deve ser maior que 0.",
        });
      }

      try {
        const carrinho = app.mongo.db?.collection("carrinho");
        if (!carrinho) {
          return reply.status(500).send({ mensagem: "Erro ao acessar o banco." });
        }

        const resultado = await carrinho.updateOne(
          { produtoId: new ObjectId(produtoId) },
          { $set: { quantidade: novaQuantidade } }
        );

        if (resultado.modifiedCount === 0) {
          return reply.status(404).send({
            mensagem: "Item não encontrado no carrinho.",
          });
        }

        return reply.send({
          mensagem: "Quantidade atualizada com sucesso!",
        });

      } catch (erro) {
        console.error(erro);
        return reply.status(500).send({
          mensagem: "Erro no servidor ao alterar quantidade.",
        });
      }
    }
  );
}
