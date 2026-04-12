import { supabase } from "@/lib/supabase";

export type AuditoriaLog = {
  id: number;
  usuario_nombre: string;
  tabla_afectada: string;
  operacion: string;
  registro_id: number | null;
  datos_anteriores: any | null;
  datos_nuevos: any | null;
  cambios: any | null;
  fecha_acceso: string;
  hora_acceso: string;
  detalles: string | null;
  created_at: string;
};

/**
 * ============================================
 * SERVICIO DE ACCESO Y AUDITORÍA
 * ============================================
 * Registra todos los accesos en la tabla auditoria_bd
 * Métodos disponibles:
 * - registrarAcceso()
 * - registrarLoginIntento()
 * - registrarError()
 * - registrarOperacion()
 * - registrarVista()
 * - obtenerAuditoria()
 * - obtenerEstadisticas()
 */

class AccesoService {
  /**
   * REGISTRA UN ACCESO GENÉRICO
   * Uso general para cualquier acción en la aplicación
   */
  async registrarAcceso(datos: {
    nombre_usuario: string;
    accion: string;
    resultado: "EXITOSO" | "FALLIDO" | "PENDIENTE";
    pagina_actual: string;
    detalles?: any;
  }) {
    try {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES");
      const hora = ahora.toLocaleTimeString("es-ES");

      const { error } = await supabase.from("auditoria_bd").insert([
        {
          usuario_nombre: datos.nombre_usuario,
          operacion: datos.accion,
          tabla_afectada: datos.pagina_actual,
          fecha_acceso: fecha,
          hora_acceso: hora,
          detalles: `[${datos.resultado}] ${datos.accion} en ${datos.pagina_actual}. ${datos.detalles ? JSON.stringify(datos.detalles) : ""}`,
          registro_id: null,
          datos_anteriores: null,
          datos_nuevos: null,
          cambios: null,
        },
      ]);

      if (error) {
        console.error("Error al registrar acceso:", error);
        return null;
      }

      return true;
    } catch (error) {
      console.error("Error en registrarAcceso:", error);
      return null;
    }
  }

  /**
   * REGISTRA UN INTENTO DE LOGIN
   * Usado en login.tsx para registrar intentos exitosos y fallidos
   */
  async registrarLoginIntento(usuario: string, exitoso: boolean, detalles?: any) {
    try {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES");
      const hora = ahora.toLocaleTimeString("es-ES");

      const { error } = await supabase.from("auditoria_bd").insert([
        {
          usuario_nombre: usuario,
          operacion: exitoso ? "LOGIN" : "LOGIN_FALLIDO",
          tabla_afectada: "usuarios",
          fecha_acceso: fecha,
          hora_acceso: hora,
          detalles: exitoso
            ? `✅ LOGIN EXITOSO - Usuario: ${usuario}`
            : `❌ LOGIN FALLIDO - Usuario: ${usuario}. ${detalles?.motivo ? detalles.motivo : ""}`,
          registro_id: null,
          datos_anteriores: null,
          datos_nuevos: detalles ? detalles : null,
          cambios: null,
        },
      ]);

      if (error) {
        console.error("Error al registrar login:", error);
        return null;
      }

      return true;
    } catch (error) {
      console.error("Error en registrarLoginIntento:", error);
      return null;
    }
  }

  /**
   * REGISTRA UN ERROR EN LA APLICACIÓN
   */
  async registrarError(usuario: string, mensaje: string, locacion: string, detalles?: any) {
    try {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES");
      const hora = ahora.toLocaleTimeString("es-ES");

      const { error } = await supabase.from("auditoria_bd").insert([
        {
          usuario_nombre: usuario,
          operacion: "ERROR",
          tabla_afectada: locacion,
          fecha_acceso: fecha,
          hora_acceso: hora,
          detalles: `⚠️ ERROR: ${mensaje}`,
          registro_id: null,
          datos_anteriores: null,
          datos_nuevos: detalles ? detalles : null,
          cambios: null,
        },
      ]);

      if (error) {
        console.error("Error al registrar error:", error);
        return null;
      }

      return true;
    } catch (error) {
      console.error("Error en registrarError:", error);
      return null;
    }
  }

  /**
   * REGISTRA UN LOGOUT
   */
  async registrarLogout(usuario: string, duracionMinutos: number) {
    try {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES");
      const hora = ahora.toLocaleTimeString("es-ES");

      const { error } = await supabase.from("auditoria_bd").insert([
        {
          usuario_nombre: usuario,
          operacion: "LOGOUT",
          tabla_afectada: "usuarios",
          fecha_acceso: fecha,
          hora_acceso: hora,
          detalles: `🔴 LOGOUT - Usuario: ${usuario} (${duracionMinutos} minutos conectado)`,
          registro_id: null,
          datos_anteriores: null,
          datos_nuevos: { duracion_minutos: duracionMinutos },
          cambios: null,
        },
      ]);

      if (error) {
        console.error("Error al registrar logout:", error);
        return null;
      }

      return true;
    } catch (error) {
      console.error("Error en registrarLogout:", error);
      return null;
    }
  }

  /**
   * REGISTRA UNA OPERACIÓN DE BD (INSERT, UPDATE, DELETE)
   */
  async registrarOperacion(
    usuario: string,
    operacion: "INSERT" | "UPDATE" | "DELETE",
    tabla: string,
    registroId: number | null = null,
    datosAnteriores: any = null,
    datosNuevos: any = null,
    cambios: any = null,
    detalles: string = "",
  ) {
    try {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES");
      const hora = ahora.toLocaleTimeString("es-ES");

      const iconoOp = {
        INSERT: "➕",
        UPDATE: "✏️",
        DELETE: "🗑️",
      };

      const { error } = await supabase.from("auditoria_bd").insert([
        {
          usuario_nombre: usuario,
          operacion: operacion,
          tabla_afectada: tabla,
          registro_id: registroId,
          fecha_acceso: fecha,
          hora_acceso: hora,
          datos_anteriores: datosAnteriores,
          datos_nuevos: datosNuevos,
          cambios: cambios,
          detalles: `${iconoOp[operacion] || "📋"} ${operacion} en ${tabla}. ${detalles}`,
        },
      ]);

      if (error) {
        console.error(`Error al registrar ${operacion}:`, error);
        return null;
      }

      return true;
    } catch (error) {
      console.error("Error en registrarOperacion:", error);
      return null;
    }
  }

  /**
   * REGISTRA UNA VISTA A UNA SECCIÓN
   */
  async registrarVista(usuario: string, seccion: string) {
    try {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-ES");
      const hora = ahora.toLocaleTimeString("es-ES");

      const { error } = await supabase.from("auditoria_bd").insert([
        {
          usuario_nombre: usuario,
          operacion: "VIEW",
          tabla_afectada: seccion,
          fecha_acceso: fecha,
          hora_acceso: hora,
          detalles: `👁️ Usuario accedió a ${seccion}`,
          registro_id: null,
          datos_anteriores: null,
          datos_nuevos: null,
          cambios: null,
        },
      ]);

      if (error) {
        console.error("Error al registrar vista:", error);
        return null;
      }

      return true;
    } catch (error) {
      console.error("Error en registrarVista:", error);
      return null;
    }
  }

  /**
   * OBTIENE TODOS LOS REGISTROS DE AUDITORÍA CON FILTROS
   */
  async obtenerAuditoria(filtros?: {
    tabla?: string;
    operacion?: string;
    fecha?: string;
    usuario?: string;
    limite?: number;
  }): Promise<AuditoriaLog[]> {
    try {
      let query = supabase.from("auditoria_bd").select("*");

      if (filtros?.tabla) {
        query = query.eq("tabla_afectada", filtros.tabla);
      }

      if (filtros?.operacion) {
        query = query.eq("operacion", filtros.operacion);
      }

      if (filtros?.fecha) {
        query = query.eq("fecha_acceso", filtros.fecha);
      }

      if (filtros?.usuario) {
        query = query.eq("usuario_nombre", filtros.usuario);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(filtros?.limite || 100);

      if (error) {
        console.error("Error al obtener auditoría:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error en obtenerAuditoria:", error);
      return [];
    }
  }

  /**
   * OBTIENE ESTADÍSTICAS DE ACCESOS
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      // Total de operaciones
      const { count: totalOps } = await supabase.from("auditoria_bd").select("*", { count: "exact", head: true });

      // Usuarios únicos
      const { data: usuarios } = await supabase.from("auditoria_bd").select("usuario_nombre").distinct();

      // Por operación
      const { data: porOp } = await supabase.from("auditoria_bd").select("operacion");

      const estadisticas: any = {
        total: totalOps || 0,
        usuariosUnicos: usuarios?.length || 0,
        porOperacion: {
          LOGIN: 0,
          LOGIN_FALLIDO: 0,
          LOGOUT: 0,
          INSERT: 0,
          UPDATE: 0,
          DELETE: 0,
          VIEW: 0,
          ERROR: 0,
        },
      };

      // Contar por operación
      porOp?.forEach((log: any) => {
        if (estadisticas.porOperacion[log.operacion] !== undefined) {
          estadisticas.porOperacion[log.operacion]++;
        }
      });

      return estadisticas;
    } catch (error) {
      console.error("Error en obtenerEstadisticas:", error);
      return null;
    }
  }

  /**
   * OBTIENE LOGINS Y LOGOUTS DE UN USUARIO
   */
  async obtenerSesionesUsuario(usuario: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("auditoria_bd")
        .select("*")
        .eq("usuario_nombre", usuario)
        .in("operacion", ["LOGIN", "LOGOUT"])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error al obtener sesiones:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error en obtenerSesionesUsuario:", error);
      return [];
    }
  }

  /**
   * GENERA REPORTE DE ACCESOS POR FECHA
   */
  async generarReportePorFecha(fecha: string): Promise<AuditoriaLog[]> {
    try {
      const { data, error } = await supabase.from("auditoria_bd").select("*").eq("fecha_acceso", fecha).order("hora_acceso", { ascending: true });

      if (error) {
        console.error("Error al generar reporte:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error en generarReportePorFecha:", error);
      return [];
    }
  }

  /**
   * GENERA REPORTE DE ACCESOS POR USUARIO
   */
  async generarReportePorUsuario(usuario: string): Promise<AuditoriaLog[]> {
    try {
      const { data, error } = await supabase.from("auditoria_bd").select("*").eq("usuario_nombre", usuario).order("created_at", { ascending: false });

      if (error) {
        console.error("Error al generar reporte:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error en generarReportePorUsuario:", error);
      return [];
    }
  }

  /**
   * OBTIENE USUARIOS ACTIVOS (LOGINS SIN LOGOUT EN LAS ÚLTIMAS 8 HORAS)
   */
  async obtenerUsuariosActivos(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("auditoria_bd").select("*").eq("operacion", "LOGIN").order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener usuarios activos:", error);
        return [];
      }

      // Filtrar últimas 8 horas
      const ahora = new Date();
      const hace8Horas = new Date(ahora.getTime() - 8 * 60 * 60 * 1000);

      const activos = (data || []).filter((log: any) => {
        const created = new Date(log.created_at || new Date());
        return created > hace8Horas;
      });

      // Eliminar duplicados (mismo usuario)
      const usuariosUnicos = Array.from(new Map(activos.map((item: any) => [item.usuario_nombre, item])).values());

      return usuariosUnicos;
    } catch (error) {
      console.error("Error en obtenerUsuariosActivos:", error);
      return [];
    }
  }
}

/**
 * EXPORTAR LA INSTANCIA DEL SERVICIO
 * Uso en cualquier archivo:
 * import accesosService from "@/lib/accesoService";
 * await accesosService.registrarAcceso({ ... });
 */
export default new AccesoService();
