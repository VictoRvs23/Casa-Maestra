"use strict";
import { Router } from "express";
import usuarioRoutes from "./usuario.routes.js";
import estudioRoutes from "./estudio.routes.js";
import residenteRoutes from "./residente.routes.js";
import authRoutes from "./auth.routes.js"

const router = Router();

router.use("/usuarios", usuarioRoutes);
router.use("/auth", authRoutes);
router.use("/estudios", estudioRoutes);
router.use("/residentes", residenteRoutes);

export default router;