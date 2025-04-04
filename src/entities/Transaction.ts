// Archivo: src/entities/Transaction.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./index";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  sender_id!: string;

  @Column()
  receiver_id!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @CreateDateColumn({ name: "transaction_date" })
  transactionDate!: Date;

  @ManyToOne(type => User, (user: User) => user.sentTransactions)
@JoinColumn({ name: "sender_id" })
sender!: User;

  @ManyToOne(() => User, (user: any) => user.receivedTransactions)
  @JoinColumn({ name: "receiver_id" })
  receiver!: User;
}