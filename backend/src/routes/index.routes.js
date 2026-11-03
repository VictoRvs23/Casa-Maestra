"use strict";
import { Router } from "express";
import usuarioRoutes from "./usuario.routes.js";
import estudioRoutes from "./estudio.routes.js";
import residenteRoutes from "./residente.routes.js";
import authRoutes from "./auth.routes.js"
import tallerRoutes from "./taller.routes.js";
import preguntaFrecuenteRoutes from "./preguntaFrecuente.routes.js";
import ticketRoutes from "./ticket.routes.js";
import miPaginaRoutes from "./miPagina.routes.js";
import paginaRoutes from "./pagina.routes.js";
import reservaRoutes from "./reserva.routes.js";
import estudio0Routes from "./estudio0.routes.js";

const router = Router();

router.use("/usuarios", usuarioRoutes);
router.use("/auth", authRoutes);
router.use("/estudios", estudioRoutes);
router.use("/residentes", residenteRoutes);
router.use("/talleres", tallerRoutes);
router.use("/preguntas-frecuentes", preguntaFrecuenteRoutes);
router.use("/tickets", ticketRoutes);
router.use("/mi-pagina", miPaginaRoutes);
router.use("/paginas", paginaRoutes);
router.use("/reservas", reservaRoutes);
router.use("/estudio0", estudio0Routes);

export default router;