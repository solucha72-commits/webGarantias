import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    const confirmed = window.confirm("¿Estás seguro de que deseas cerrar sesión?");

    if (confirmed) {
      // Limpiar sesión
      sessionStorage.removeItem("usuarioActual");
      localStorage.removeItem("usuarioActual");

      // Recargar página (vuelve al login automáticamente)
      window.location.reload();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
      <View style={styles.screen}>
        {/* Contenedor Principal (Card) */}
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Garantías</Text>
            <Text style={styles.subtitle}>Gestor Documental Garantías</Text>
          </View>

          <View style={styles.buttonGrid}>
            {/* 1. Botón Escanear */}
            <Pressable style={({ pressed }) => [styles.scanButton, pressed && { opacity: 0.8 }]} onPress={() => router.push("/escaner")}>
              <Text style={styles.buttonText}>📷 Escanear Ticket</Text>
            </Pressable>

            {/* 2. Botón Nueva Alta Manual */}
            <Pressable style={({ pressed }) => [styles.formButton, pressed && { opacity: 0.8 }]} onPress={() => router.push("/altas")}>
              <Text style={styles.buttonText}>📝 Nueva Alta Manual</Text>
            </Pressable>

            {/* 3. Botón Informes */}
            <Pressable style={({ pressed }) => [styles.informesButton, pressed && { opacity: 0.8 }]} onPress={() => router.push("/informes")}>
              <Text style={styles.buttonText}>📊 Informes</Text>
            </Pressable>

            <View style={styles.divider} />

            {/* 4. Botón Mis Garantías Guardadas */}
            <Pressable style={({ pressed }) => [styles.listButton, pressed && { opacity: 0.8 }]} onPress={() => router.push("/formulario")}>
              <Text style={styles.listButtonText}>📋 Mis Garantías Guardadas</Text>
            </Pressable>

            <View style={styles.divider} />

            {/* 5. BOTÓN ADMIN */}
            <Pressable style={({ pressed }) => [styles.adminButton, pressed && { opacity: 0.8 }]} onPress={() => router.push("/admin")}>
              <Text style={styles.adminButtonText}>⚙️ Admin</Text>
            </Pressable>

            {/* 6. BOTÓN LOGOUT */}
            <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.8 }]} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 Salir</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>Versión 2.4.3 - 2026</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  screen: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 800 : "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    paddingVertical: 60,
    paddingHorizontal: 45,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    alignItems: "center",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0px 20px 40px rgba(0,0,0,0.06)",
      },
    }),
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 45,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 5,
    textAlign: "center",
  },
  buttonGrid: {
    width: "100%",
  },
  scanButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  formButton: {
    width: "100%",
    backgroundColor: "#10b981",
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },

  informesButton: {
    width: "100%",
    backgroundColor: "#f59e0b",
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 25,
    width: "80%",
    alignSelf: "center",
  },
  listButton: {
    width: "100%",
    backgroundColor: "#eab398",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  listButtonText: {
    color: "#475569",
    fontSize: 18,
    fontWeight: "700",
  },
  adminButton: {
    width: "100%",
    backgroundColor: "#6366f1",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  adminButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
  },
  footerText: {
    marginTop: 40,
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
});
