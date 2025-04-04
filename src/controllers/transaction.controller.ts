import { Response } from "express";
import { AppDataSource } from "../config/database";
import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validationResult } from "express-validator";

// Repositorios
const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

// Realizar transferencia
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  // Validar datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { receiverAccountNumber, amount } = req.body;
  const senderId = req.user.id;

  // Verificar monto positivo
  if (amount <= 0) {
    res.status(400).json({ message: "El monto debe ser mayor que cero" });
    return;
  }

  try {
    // Iniciar transacción de base de datos
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener usuario remitente
      const sender = await queryRunner.manager.findOne(User, { where: { id: senderId } });
      if (!sender) {
        res.status(404).json({ message: "Usuario remitente no encontrado" });
        await queryRunner.release();
        return;
      }

      // Verificar saldo suficiente
      if (Number(sender.balance) < amount) {
        res.status(400).json({ message: "Saldo insuficiente" });
        await queryRunner.release();
        return;
      }

      // Obtener usuario destinatario
      const receiver = await queryRunner.manager.findOne(User, { 
        where: { account_number: receiverAccountNumber } 
      });
      if (!receiver) {
        res.status(404).json({ message: "Usuario destinatario no encontrado" });
        await queryRunner.release();
        return;
      }

      // Verificar que no sea transferencia a sí mismo
      if (sender.id === receiver.id) {
        res.status(400).json({ message: "No puedes transferir dinero a tu propia cuenta" });
        await queryRunner.release();
        return;
      }

      // Actualizar saldos
      sender.balance = Number(sender.balance) - amount;
      receiver.balance = Number(receiver.balance) + amount;

      // Guardar cambios en usuarios
      await queryRunner.manager.save(sender);
      await queryRunner.manager.save(receiver);

      // Crear registro de transacción
      const newTransaction = transactionRepository.create({
        sender_id: sender.id,
        receiver_id: receiver.id,
        amount,
      });

      // Guardar transacción
      await queryRunner.manager.save(newTransaction);

      // Confirmar transacción
      await queryRunner.commitTransaction();

      res.status(201).json({
        message: "Transferencia realizada con éxito",
        transaction: newTransaction,
      });
    } catch (error) {
      // Revertir cambios en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  } catch (error) {
    console.error("Error al realizar la transferencia:", error);
    res.status(500).json({ message: "Error al realizar la transferencia" });
  }
};

// Obtener historial de transacciones
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user.id;

  try {
    // Buscar todas las transacciones del usuario (enviadas y recibidas)
    const transactions = await transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.sender", "sender")
      .leftJoinAndSelect("transaction.receiver", "receiver")
      .where("transaction.sender_id = :userId OR transaction.receiver_id = :userId", { userId })
      .orderBy("transaction.transactionDate", "DESC")
      .getMany();

    // Formatear datos para respuesta
    const formattedTransactions = transactions.map(t => {
      const isSender = t.sender_id === userId;
      return {
        id: t.id,
        amount: t.amount,
        type: isSender ? "enviado" : "recibido",
        date: t.transactionDate,
        counterparty: isSender 
          ? { id: t.receiver.id, name: t.receiver.name, account: t.receiver.account_number }
          : { id: t.sender.id, name: t.sender.name, account: t.sender.account_number }
      };
    });

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error al obtener historial de transacciones:", error);
    res.status(500).json({ message: "Error al obtener historial de transacciones" });
  }
};

// Obtener detalles de una transacción específica
export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Buscar transacción por ID
    const transaction = await transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.sender", "sender")
      .leftJoinAndSelect("transaction.receiver", "receiver")
      .where("transaction.id = :id", { id })
      .getOne();

    if (!transaction) {
      res.status(404).json({ message: "Transacción no encontrada" });
      return;
    }

    // Verificar que el usuario esté relacionado con la transacción
    if (transaction.sender_id !== userId && transaction.receiver_id !== userId) {
      res.status(403).json({ message: "No tienes permiso para ver esta transacción" });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error al obtener detalles de la transacción:", error);
    res.status(500).json({ message: "Error al obtener detalles de la transacción" });
  }
};