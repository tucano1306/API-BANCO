import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import path from "path";
import pug from "pug";

dotenv.config();

// Crear el transporter para enviar correos
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER || "tu-correo@gmail.com",
    pass: process.env.MAIL_PASSWORD || "tu-contraseña-de-aplicación",
  },
});

// Función para enviar correo de confirmación
export const sendConfirmationEmail = async (
  to: string, 
  name: string, 
  accountNumber: string
) => {
  try {
    // Ruta a la plantilla de correo
    const templatePath = path.join(__dirname, "../templates/emails/confirmation.pug");
    
    // Compilar la plantilla
    const template = pug.compileFile(templatePath);
    
    // Renderizar la plantilla con los datos
    const html = template({
      name,
      accountNumber,
      year: new Date().getFullYear()
    });

    // Enviar el correo
    const result = await transporter.sendMail({
      from: `"Banco App" <${process.env.MAIL_FROM || "tu-correo@gmail.com"}>`,
      to,
      subject: "Bienvenido a Banco App - Registro Exitoso",
      html,
    });

    console.log("Correo enviado con éxito:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error al enviar correo de confirmación:", error);
  }
};

// Alternativa simple para desarrollo
export const debugConfirmationEmail = async (
  to: string, 
  name: string, 
  accountNumber: string
) => {
  console.log("-------- CORREO DE CONFIRMACIÓN --------");
  console.log("Para:", to);
  console.log("Asunto: Bienvenido a Banco App - Registro Exitoso");
  console.log("Contenido: Bienvenido", name, "su número de cuenta es", accountNumber);
  console.log("---------------------------------------");
};