import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { generateAccountNumber } from "../utils/accountGenerator";
import { sendConfirmationEmail, debugConfirmationEmail } from "../config/mail"; // Importamos ambas funciones
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../utils/jwt.utils";

// Repositorio de usuarios
const userRepository = AppDataSource.getRepository(User);

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  console.log("⭐ Backend recibió solicitud de registro");
  console.log("📦 Cuerpo de la solicitud:", req.body);

  // Validar datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;

  try {
    // Verificar si el email ya existe
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "El correo electrónico ya está registrado" });
      return;
    }

    // Generar número de cuenta
    const accountNumber = generateAccountNumber();

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      account_number: accountNumber,
      balance: 1000, // Saldo inicial
    });

    // Guardar usuario en la base de datos
    await userRepository.save(newUser);

    // Enviar correo de confirmación
    // Nota: En desarrollo, puedes usar debugConfirmationEmail para no enviar correos reales
    await sendConfirmationEmail(email, name, accountNumber);

    // Generar JWT
    const token = generateToken({ id: newUser.id, email: newUser.email });

    // Responder con el token y datos del usuario (sin la contraseña)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

// Inicio de sesión
export const login = async (req: Request, res: Response): Promise<void> => {
  // Validar datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Credenciales inválidas" });
      return;
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Credenciales inválidas" });
      return;
    }

    // Generar JWT
    const token = generateToken({ id: user.id, email: user.email });

    // Responder con el token y datos del usuario (sin la contraseña)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};