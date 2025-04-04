// Archivo: src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Transaction } from "./index";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ length: 20, unique: true })
  account_number!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance!: number;

  @CreateDateColumn()
  created_at!: Date;
  
  @OneToMany(type => Transaction, (transaction: Transaction) => transaction.sender)
  sentTransactions!: Transaction[];

  @OneToMany(() => Transaction, (transaction: any) => transaction.receiver)
  receivedTransactions!: Transaction[];
}