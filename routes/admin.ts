import { Router, Request, Response } from "express";
import AdminAuth from "../src/middleware/adminAuth.js";
import Auth from "../src/middleware/auth.js";

const router = Router();

// Interface opcional para tipar corretamente o req.usuarioId e req.tipo
interface AdminRequest extends Request {
  usuarioId?: number;
  tipo?: string;
}

router.get("/", Auth, AdminAuth, (req: AdminRequest, res: Response) => {
  res.json({
    message: "Bem-vindo à área de administração!",
    user: {
      id: req.usuarioId,
      tipo: req.tipo,
    },
  });
});

export default router;
