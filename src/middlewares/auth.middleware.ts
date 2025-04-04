import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import * as dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Obtener el token del header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Verificar si existe el token
  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado" });
  }

  try {
    // Verificar el token
    const decoded = verifyToken(token);
    
    // Añadir el usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};