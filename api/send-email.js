export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, csv, filtros } = req.body;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!to || !csv) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .header h1 { margin: 0; }
            .content { margin: 20px 0; }
            .filtros { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .filtro-item { margin: 10px 0; padding: 8px; background-color: white; border-left: 3px solid #3b82f6; padding-left: 12px; }
            .label { font-weight: bold; color: #1f2937; }
            .csv-box { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 12px; max-height: 400px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Informe de Garantías</h1>
            </div>
            
            <div class="content">
              <p>¡Hola!</p>
              <p>Se ha generado un informe de garantías el <strong>${new Date().toLocaleDateString("es-ES")}</strong> a las <strong>${new Date().toLocaleTimeString("es-ES")}</strong>.</p>
              
              <div class="filtros">
                <h3>📋 Filtros Aplicados:</h3>
                <div class="filtro-item">
                  <span class="label">Familia:</span> ${filtros?.familia || "Todas"}
                </div>
                <div class="filtro-item">
                  <span class="label">Marca:</span> ${filtros?.marca || "Todas"}
                </div>
                <div class="filtro-item">
                  <span class="label">Centro:</span> ${filtros?.centro || "Todos"}
                </div>
              </div>

              <h3>📊 Datos del Informe (CSV):</h3>
              <div class="csv-box">${csv.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>

              <div class="footer">
                <p>Este informe fue generado automáticamente por el sistema de Garantías.</p>
                <p>No responda a este correo.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Llamar a la API de Resend directamente
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Garantías <onboarding@resend.dev>',
        to: to,
        subject: subject || '📊 Informe de Garantías',
        html: htmlContent,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', data);
      return res.status(400).json({ error: data.message || 'Error sending email' });
    }

    return res.status(200).json({ 
      success: true, 
      id: data.id,
      message: `Informe enviado correctamente a ${to}`
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: errorMsg });
  }
}
