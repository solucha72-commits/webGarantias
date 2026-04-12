import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { iniciarConexionDiaria } from "@/lib/conexion-diaria";

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
