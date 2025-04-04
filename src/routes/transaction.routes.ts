import { Router } from "express";
import { 
  createTransaction, 
  getTransactions, 
  getTransactionById 
} from "../controllers/transaction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { body } from "express-validator";

const router = Router();

// Crear un tipo para los controladores de Express
type ExpressHandler = (req: any, res: any, next?: any) => Promise<any> | any;

// Ruta para realizar transferencia
router.post(
  "/",
  [
    body("receiverAccountNumber")
      .not()
      .isEmpty()
      .withMessage("El número de cuenta del destinatario es obligatorio"),
    body("amount")
      .isNumeric()
      .withMessage("El monto debe ser un número")
      .custom((value) => value > 0)
      .withMessage("El monto debe ser mayor que cero"),
  ],
  authMiddleware,
  createTransaction as ExpressHandler
);

// Ruta para obtener historial de transacciones
router.get("/", authMiddleware, getTransactions as ExpressHandler);

// Ruta para obtener detalles de una transacción específica
router.get("/:id", authMiddleware, getTransactionById as ExpressHandler);

export default router;