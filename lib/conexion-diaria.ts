import { supabase } from "@/lib/supabase";
import accesosService from "@/lib/accesoService";

/**
 * CONECTAR A SUPABASE CADA 24 HORAS Y REGISTRAR EN AUDITORÍA
 * Mantiene vivo el proyecto de Supabase evitando que se pause
 * Úsalo en tu index.tsx (splash screen)
 */

let ultimoConexion: number = 0;

export function iniciarConexionDiaria() {
  console.log("🔌 Iniciando sistema de conexión a Supabase cada 24 horas...");
  
  // Conectar ahora mismo
  conectarSupabase();

  // Conectar cada 24 horas (86400000 ms)
  setInterval(() => {
    conectarSupabase();
  }, 24 * 60 * 60 * 1000); // 24 horas exactas

  console.log("✅ Sistema configurado: ping a Supabase cada 24 horas");
}

async function conectarSupabase() {
  try {
    const ahora = new Date();
    const horaFormato = ahora.toLocaleTimeString("es-ES");
    
    // Evitar múltiples conexiones en corto tiempo
    const tiempoActual = Date.now();
    if (tiempoActual - ultimoConexion < 60000) {
      console.log("⏭️ Conexión muy reciente, saltando...");
      return;
    }
    ultimoConexion = tiempoActual;

    console.log(`🔌 [${horaFormato}] Haciendo ping a Supabase...`);

    // Ping a la BD
    const { data, error } = await supabase
      .from("garantias")
      .select("id")
      .limit(1);

    if (error) {
      console.error(`❌ Error en ping:`, error.message);
      
      // Registrar fallo en auditoría
      await accesosService.registrarAcceso({
        nombre_usuario: "SISTEMA",
        accion: "PING_CONEXION",
        resultado: "FALLIDO",
        pagina_actual: "MANTENIMIENTO",
        detalles: {
          razon: error.message,
          hora: horaFormato,
        },
      });
      return;
    }

    console.log(`✅ [${horaFormato}] Ping exitoso - Proyecto activo`);
    
    // REGISTRAR ÉXITO EN AUDITORÍA
    await accesosService.registrarAcceso({
      nombre_usuario: "SISTEMA",
      accion: "PING_CONEXION",
      resultado: "EXITOSO",
      pagina_actual: "MANTENIMIENTO",
      detalles: {
        descripcion: "Verificación de conexión cada 24 horas",
        hora: horaFormato,
        fecha: ahora.toLocaleDateString("es-ES"),
      },
    });

  } catch (error: any) {
    console.error(`❌ Excepción en ping:`, error.message);
    
    // Registrar excepción
    await accesosService.registrarError(
      "SISTEMA",
      error.message || "Error en conexión automática",
      "MANTENIMIENTO",
      { tipo: "EXCEPCION_PING" }
    );
  }
}
