const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'troco_pra_producao';

// Middleware para verificar se o token é válido
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // Verifica se o header começa com 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ausente ou formato incorreto' });
  }

  // Extrai o token (tudo depois de 'Bearer ')
  const token = authHeader.split(' ')[1];

  // Verifica o token JWT
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Armazena os dados do usuário decodificados (ex: id, role, etc.)
    req.user = payload;
    next();
  });
}

// Middleware para verificar o papel (role) do usuário
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    next();
  };
}

module.exports = { authenticateToken, requireRole };
