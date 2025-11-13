import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth";
import User from "../models/User";

const router = express.Router();

//retornar todos os usuarios cadastrados (apenas admin)
router.get("/usuarios", authMiddleware, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find({}, "-senha");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar usuarios" });
  }
});

export default router;
