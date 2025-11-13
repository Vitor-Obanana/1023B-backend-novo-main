import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

// 🧩 Importa tuas rotas
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js';
import cartRoutes from './rotas/cartRoutes.js';
import adminRoutes from './rotas/adminRoutes.js';

const app = express();

// 🧩 Middlewares globais
app.use(cors());
app.use(express.json());

// 🔗 Conexão com o MongoDB Atlas
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function conectarBanco() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'marketplace');
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
export { db };
