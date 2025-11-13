import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { MongoClient, Db } from 'mongodb'; // Importando Db para tipagem

// 🧩 Importa tuas rotas
// ✅ CORREÇÃO: Adicionado a extensão .js para resolução de módulos ESM
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js';
import cartRoutes from './rotas/cartRoutes.js';
import adminRoutes from './rotas/adminRoutes.js';

const app: Express = express(); // Tipando 'app'

// 🧩 Middlewares globais
app.use(cors());
app.use(express.json());

// 🔗 Conexão com o MongoDB Atlas
const mongoUri = process.env.MONGO_URI;

// ✅ CORREÇÃO: Type Guard para garantir que MONGO_URI existe
if (!mongoUri) {
    console.error('❌ Variável de ambiente MONGO_URI não está definida.');
    process.exit(1);
}

const client = new MongoClient(mongoUri); // Agora o TS aceita
let db: Db; // Tipando 'db' como o tipo Db do MongoDB

async function conectarBanco() {
    try {
        await client.connect();
        // Garante que DB_NAME existe ou usa 'marketplace'
        const dbName = process.env.DB_NAME || 'marketplace';
        db = client.db(dbName);
        console.log('✅ Conectado ao MongoDB Atlas');

        // 🔓 Rotas públicas (sem login)
        app.use(rotasNaoAutenticadas);

        // 🔒 Rotas protegidas (com autenticação)
        app.use(rotasAutenticadas);

        // 🛒 Outras rotas específicas
        app.use('/api/carrinhos', cartRoutes);
        app.use('/api/admin', adminRoutes);

        // 🚀 Inicializa o servidor
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`✅ Servidor rodando na porta ${PORT}`);
        });
    } catch (erro) {
        console.error('❌ Erro ao conectar ao MongoDB:', erro);
        process.exit(1);
    }
}

conectarBanco();

// Exporta o db para outros arquivos (controllers, etc.)
// ✅ CORREÇÃO: Garante que 'db' seja exportado no formato ESM
export { db };