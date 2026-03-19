// ============================================
// ENVIAR EMAIL DESDE TU HOTMAIL - SOLUCIÓN SIMPLE
// ============================================
// Archivo: @/lib/emailService.ts

import axios from "axios";
import { Alert } from "react-native";

// Tu email y contraseña de aplicación
const TU_EMAIL = "s.olucha@hotmail.es";
const TU_CONTRASEÑA_APP = "Jorgepablo0912@0912"; // La de 16 caracteres

// ============================================
// FUNCIÓN: Enviar Email
// ============================================

export const enviarEmailDesdeHotmail = async (
  emailDestino: string,
  nombreProducto: string,
  marca: string,
  numeroSerie: string,
  fechaVencimiento: string,
  centroCompra: string,
) => {
  try {
    // Validar email destino
    if (!emailDestino || !emailDestino.includes("@")) {
      throw new Error("Email inválido");
    }

    // Mensaje en HTML
    const htmlContent = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">📄 Información de Garantía</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Detalles del Producto</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Producto:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${nombreProducto}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Marca:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${marca}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Nº de Serie:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${numeroSerie}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Fecha Vencimiento:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">${fechaVencimiento}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Centro de Compra:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${centroCompra}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            Este email fue enviado automáticamente desde tu app de garantías.
          </p>
        </div>
      </div>
    `;

    // Enviar email usando un servicio backend simple
    const response = await fetch("https://smtp-email-api.vercel.app/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_email: TU_EMAIL,
        from_password: TU_CONTRASEÑA_APP,
        to_email: emailDestino,
        subject: `📄 Garantía - ${nombreProducto}`,
        html_content: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al enviar el email");
    }

    return {
      success: true,
      message: "✅ Email enviado correctamente a " + emailDestino,
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      success: false,
      message: "❌ Error: " + error.message,
    };
  }
};

// ============================================
// ALTERNATIVA: Si prefieres usar NodeJS localmente
// ============================================

/*
// En tu servidor Node.js (app.js o similar):

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'tu_email@hotmail.com',
    pass: 'xxxx xxxx xxxx xxxx' // Contraseña de app
  }
});

app.post('/api/enviar-email', async (req, res) => {
  const { emailDestino, asunto, html } = req.body;

  try {
    await transporter.sendMail({
      from: 'tu_email@hotmail.com',
      to: emailDestino,
      subject: asunto,
      html: html
    });

    res.json({ success: true, message: '✅ Email enviado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
