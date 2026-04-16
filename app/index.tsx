import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { iniciarConexionDiaria } from "@/lib/conexion-diaria";
import accesosService from "@/lib/accesoService";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // ✅ CONEXIÓN A SUPABASE CADA 24 HORAS
    iniciarConexionDiaria();

    const checkAuth = async () => {
      // Espera 500ms para que React termine de renderizar
      await new Promise((resolve) => setTimeout(resolve, 500));

      const usuario = sessionStorage.getItem("usuarioActual");
      console.log("Usuario encontrado:", usuario);

      if (usuario) {
        try {
          const usuarioParsed = JSON.parse(usuario);
          const usuarioNombre = usuarioParsed.nombre || usuarioParsed.email || "Desconocido";

          // ✅ REGISTRAR ENTRADA DIARIA
          console.log("Registrando entrada de:", usuarioNombre);
          await accesosService.registrarAcceso({
            nombre_usuario: usuarioNombre,
            accion: "ENTRADA_DIARIA",
            resultado: "EXITOSO",
            pagina_actual: "SPLASH_SCREEN",
            detalles: {
              fecha: new Date().toLocaleDateString("es-ES"),
              hora: new Date().toLocaleTimeString("es-ES"),
              tipo_evento: "APERTURA_APLICACION",
            },
          });

          console.log("✅ Entrada registrada correctamente");
        } catch (error) {
          console.error("❌ Error al registrar entrada:", error);
        }

        console.log("Redirigiendo a tabs");
        // @ts-ignore
        router.replace("/(tabs)");
      } else {
        console.log("Redirigiendo a login");
        // @ts-ignore
        router.replace("/(auth)/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
