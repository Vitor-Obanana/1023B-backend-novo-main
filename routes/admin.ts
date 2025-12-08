import { Router } from "express";
import AdminAuth from "../src/middleware/adminAuth.js";
import Auth from "../src/middleware/auth.js";


const router = Router();

router.get("/", Auth, AdminAuth, (req: any, res) => {
  res.json({
    message: "Bem-vindo à área de administração!",
    user: {
      id: req.usuarioId,
      tipo: req.tipo,
    },
  });
});

export default router;