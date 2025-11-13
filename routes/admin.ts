import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Interface para estender a Request do Express e incluir 'user' (payload do JWT)
interface AuthenticatedRequest extends Request {
    user?: { 
        id?: string;
        role?: 'ADMIN' | 'USER';
        [key: string]: any; 
    };
}

const JWT_SECRET = process.env.JWT_SECRET || 'troco_pra_producao';

// Middleware para verificar se o token é válido
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token ausente ou formato incorreto' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token malformado após Bearer' });
    }

    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, payload: any) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        req.user = payload; 
        next();
    });
}

// Função auxiliar para verificar o papel (role) do usuário
function requireRole(role: 'ADMIN' | 'USER' | string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        // Acesso seguro à propriedade 'role'
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Permissão negada' });
        }

        next();
    };
}

// Middleware específico para admin (chamado de 'isAdmin' nas rotas)
export const isAdmin = requireRole('ADMIN');

// ✅ CORREÇÃO: Exportando os membros esperados pelo admin.ts no formato CJS
module.exports = { authMiddleware, isAdmin, requireRole };