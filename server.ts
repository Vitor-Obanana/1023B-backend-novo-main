// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marketplace', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('Mongo conectado')).catch(e => console.error(e));

app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));

// tratamento de erros básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno' });
});

const PORT = process.env.PORT || 5123;
app.listen(PORT, () => console.log('Servidor rodando na porta', PORT));
