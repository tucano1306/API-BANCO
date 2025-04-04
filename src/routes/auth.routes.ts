import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { body } from "express-validator";

const router = Router();

// Crear un tipo para los controladores de Express
type ExpressHandler = (req: any, res: any, next?: any) => Promise<any> | any;

// Ruta para registro
router.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  register as ExpressHandler
);

// Ruta para login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").not().isEmpty().withMessage("La contraseña es obligatoria"),
  ],
  login as ExpressHandler
);

export default router;