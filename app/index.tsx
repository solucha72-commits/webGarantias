import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { iniciarConexionDiaria } from "@/lib/conexion-diaria";
import accesosService from "@/lib/accesoService";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const inicializar = async () => {
      try {
        // ✅ PASO 1: INICIAR SISTEMA DE CONEXIÓN CADA 24 HORAS
        console.log("🔌 Iniciando sistema de conexión a Supabase...");
        iniciarConexionDiaria();
        console.log("✅ Sistema de conexión inicializado");

        // ✅ PASO 2: ESPERAR UN POCO PARA QUE REACT TERMINE
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!mounted) return;

        // ✅ PASO 3: VERIFICAR SI HAY USUARIO AUTENTICADO
        const usuarioGuardado = sessionStorage.getItem("usuarioActual");
        console.log("🔐 Verificando autenticación...", usuarioGuardado ? "Sí" : "No");

        if (usuarioGuardado) {
          // USUARIO AUTENTICADO
          try {
            const usuarioParsed = JSON.parse(usuarioGuardado);
            const usuarioNombre = usuarioParsed.nombre || usuarioParsed.email || "Desconocido";

            console.log(`✅ Usuario autenticado: ${usuarioNombre}`);

            // ✅ REGISTRAR ENTRADA DIARIA EN AUDITORÍA
            console.log("📊 Registrando entrada diaria...");
            const resultadoEntrada = await accesosService.registrarAcceso({
              nombre_usuario: usuarioNombre,
              accion: "ENTRADA_DIARIA",
              resultado: "EXITOSO",
              pagina_actual: "SPLASH_SCREEN",
              detalles: {
                fecha: new Date().toLocaleDateString("es-ES"),
                hora: new Date().toLocaleTimeString("es-ES"),
                tipo_evento: "APERTURA_APLICACION",
                rol: usuarioParsed.rol || "usuario",
              },
            });

            if (resultadoEntrada) {
              console.log("✅ Entrada registrada correctamente en auditoría");
            } else {
              console.warn("⚠️ Entrada registrada pero no se pudo guardar en BD");
            }

            // ✅ REDIRIGIR AL MENÚ PRINCIPAL
            console.log("🚀 Redirigiendo a menú principal...");
            if (mounted) {
              // @ts-ignore
              router.replace("/(tabs)");
            }
          } catch (error: any) {
            console.error("❌ Error procesando usuario autenticado:", error);

            // Registrar el error
            await accesosService.registrarError(
              "SISTEMA",
              error.message || "Error en splash screen",
              "SPLASH_SCREEN",
              { tipo: "ERROR_AUTENTICACION" }
            );

            // Redirigir a login como fallback
            if (mounted) {
              // @ts-ignore
              router.replace("/(auth)/login");
            }
          }
        } else {
          // NO HAY USUARIO AUTENTICADO
          console.log("❌ No hay usuario autenticado");
          console.log("🚀 Redirigiendo a login...");

          if (mounted) {
            // @ts-ignore
            router.replace("/(auth)/login");
          }
        }
      } catch (error: any) {
        console.error("❌ Error crítico en splash screen:", error);

        if (mounted) {
          // Redirigir a login como fallback
          // @ts-ignore
          router.replace("/(auth)/login");
        }
      }
    };

    inicializar();

    // Cleanup: evitar memory leaks
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f0f4f8",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
