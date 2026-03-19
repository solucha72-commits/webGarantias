// ============================================
// SERVICIO DE EMAIL HOTMAIL
// ============================================
// Archivo: @/lib/emailService.ts
// Copiar este archivo a esa ruta en tu proyecto

import axios from "axios";
import { Alert } from "react-native";

// ⚠️ REEMPLAZA ESTOS VALORES CON LOS TUYOS
const TU_EMAIL = "s.olucha@hotmail.es";
const TU_CONTRASEÑA_APP = "Jorgepablo0912@0912"; // La de 16 caracteress

// ============================================
// FUNCIÓN: Enviar Email desde Hotmail
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
    console.log("📧 Enviando email a:", emailDestino);

    // Validar email destino
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailDestino)) {
      throw new Error("Email inválido. Ingresa un email correcto.");
    }

    // Construir HTML del email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📄 Información de Garantía</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          
          <h2 style="color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 18px;">Detalles del Producto</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="background: #fff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; width: 40%;">📦 Producto:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${nombreProducto || "N/A"}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">🏷️ Marca:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${marca || "N/A"}</td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">🔐 Nº de Serie:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937; word-break: break-all;">${numeroSerie || "N/A"}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">⏳ Fecha Vencimiento:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">${fechaVencimiento || "N/A"}</td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">🏪 Centro de Compra:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1f2937;">${centroCompra || "N/A"}</td>
            </tr>
          </table>

          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 12px;">
              ℹ️ Este email fue enviado automáticamente desde tu app de garantías.
            </p>
          </div>

        </div>
      </div>
    `;

    // Intentar enviar usando un servicio externo gratuito
    // (Alternativa si no tienes servidor propio)

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", {
      sender: {
        name: "Tu App Garantías",
        email: TU_EMAIL,
      },
      to: [
        {
          email: emailDestino,
          name: "Cliente",
        },
      ],
      subject: `📄 Garantía - ${nombreProducto}`,
      htmlContent: htmlContent,
    });

    console.log("✅ Email enviado:", response.data);

    return {
      success: true,
      message: `✅ Email enviado correctamente a ${emailDestino}`,
    };
  } catch (error: any) {
    console.error("❌ Error al enviar email:", error);

    // Mensaje de error más específico
    let errorMsg = "Error desconocido";

    if (error.response?.status === 401) {
      errorMsg = "Error de autenticación. Verifica tu contraseña.";
    } else if (error.response?.status === 400) {
      errorMsg = "Email inválido o parámetros incorrectos.";
    } else if (error.code === "ECONNREFUSED") {
      errorMsg = "No hay conexión a internet.";
    } else if (error.message) {
      errorMsg = error.message;
    }

    return {
      success: false,
      message: `❌ Error: ${errorMsg}`,
    };
  }
};

// ============================================
// FUNCIÓN ALTERNATIVA: Usando un servidor Node.js local
// ============================================
// Si quieres ejecutar tu propio servidor en tu PC:

export const enviarEmailDesdeHotmailLocal = async (
  emailDestino: string,
  nombreProducto: string,
  marca: string,
  numeroSerie: string,
  fechaVencimiento: string,
  centroCompra: string,
) => {
  try {
    console.log("📧 Enviando email (servidor local) a:", emailDestino);

    // Cambiar 'localhost' por tu IP si usas móvil físico
    // Ejemplo: 'http://192.168.1.100:3001'
    const serverUrl = "http://localhost:3001";

    const response = await axios.post(`${serverUrl}/api/enviar-email`, {
      to_email: emailDestino,
      subject: `📄 Garantía - ${nombreProducto}`,
      product_name: nombreProducto,
      brand: marca,
      serial_number: numeroSerie,
      expiration_date: fechaVencimiento,
      purchase_center: centroCompra,
    });

    return {
      success: true,
      message: `✅ Email enviado a ${emailDestino}`,
    };
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return {
      success: false,
      message: `❌ Error: ${error.message}`,
    };
  }
};
