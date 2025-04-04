import { Router } from "express";
import { getMe } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Crear un tipo para los controladores de Express
type ExpressHandler = (req: any, res: any, next?: any) => Promise<any> | any;

// Ruta para obtener información del usuario autenticado
router.get("/me", authMiddleware, getMe as ExpressHandler);

export default router;