import { Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { AuthRequest } from "../middlewares/auth.middleware";

// Repositorio de usuarios
const userRepository = AppDataSource.getRepository(User);

// Obtener información del usuario autenticado
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Buscar usuario por ID
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    
    // Retornar información del usuario (sin la contraseña)
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    res.status(500).json({ message: "Error al obtener información del usuario" });
  }
};