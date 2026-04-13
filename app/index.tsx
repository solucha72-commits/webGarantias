import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { iniciarConexionDiaria } from "@/lib/conexion-diaria";
import accesosService from "@/lib/accesoService";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    iniciarConexionDiaria();

    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const usuario = sessionStorage.getItem("usuarioActual");
      console.log("Usuario encontrado:", usuario);

      if (usuario) {
        const usuarioParsed = JSON.parse(usuario);
        const usuarioNombre = usuarioParsed.nombre || usuarioParsed.email || "Desconocido";

        // ✅ REGISTRAR ENTRADA DIARIA
        await accesosService.registrarAcceso({
          nombre_usuario: usuarioNombre,
          accion: "ENTRADA_DIARIA",
          resultado: "EXITOSO",
          pagina_actual: "SPLASH_SCREEN",
        });

        router.replace("/(tabs)");
      } else {
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
