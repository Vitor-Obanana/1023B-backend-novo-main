import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class UsuarioController {
    async adicionar(req: Request, res: Response) {
        const { nome, idade, email, senha, tipo } = req.body;

        if (!nome || !email || !senha || !idade) {
            return res.status(400).json({ mensagem: "Dados incompletos (nome,email,senha,idade)" });
        }

        // tipo padrão = USER
        const tipoUsuario = tipo || "USER";

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = {
            nome,
            idade,
            email,
            senha: senhaCriptografada,
            tipo: tipoUsuario
        };

        const resultado = await db.collection('usuarios')
            .insertOne(usuario);

        res.status(201).json({ ...usuario, _id: resultado.insertedId });
    }

    async listar(req: Request, res: Response) {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.status(200).json(usuarios);
    }

    async login(req: Request, res: Response) {
        console.log("Login chamado");

        const { email, senha } = req.body;

        if (!email || !senha)
            return res.status(400).json({ mensagem: "Email e senha são obrigatórios!" });

        const usuario = await db.collection("usuarios").findOne({ email });
        if (!usuario)
            return res.status(400).json({ mensagem: "Usuário incorreto!" });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida)
            return res.status(400).json({ mensagem: "Senha Inválida!" });

        // token agora inclui tipo
        const token = jwt.sign(
            {
                usuarioId: usuario._id,
                tipo: usuario.tipo  // <<<< AQUI ENTRA O ADMIN
            },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    }

    // 🔥 ROTA PARA ADMIN: listar usuários
    async listarApenasAdmins(req: Request, res: Response) {
        try {
            const usuarios = await db.collection('usuarios').find().toArray();
            return res.status(200).json(usuarios);
        } catch (erro) {
            console.log(erro);
            return res.status(500).json({ mensagem: "Erro ao listar usuários" });
        }
    }
}

export default new UsuarioController();
