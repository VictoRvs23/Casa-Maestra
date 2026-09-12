"use strict";
import { Router } from "express";
import { login, registro } from "../controllers/auth.controller.js";
import { LoginValidation, RegistroValidation } from "../validations/usuario.validation.js"; 
import { validateBody } from "../middleware/validateBody.js";

const router = Router();

router.post("/registro",validateBody(RegistroValidation), registro);
router.post("/login", validateBody(LoginValidation), login);

export default router;