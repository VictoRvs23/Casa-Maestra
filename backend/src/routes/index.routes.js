"use strict";
import { Router } from "express";
import usuarioRoutes from "./usuario.routes.js";
import authRoutes from "./auth.routes.js"

const router = Router();

router.use("/usuario", usuarioRoutes);
router.use("/auth", authRoutes);

export default router;