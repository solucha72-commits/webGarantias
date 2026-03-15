import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function AdminScreen() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  useEffect(() => {
    const usuario = sessionStorage.getItem("usuarioActual");
    if (usuario) {
      setUsuarioActual(JSON.parse(usuario));
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>👥 Gestión de Usuarios</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Usuario actual:</Text>
            <Text style={styles.infoValue}>{usuarioActual?.email || "Cargando..."}</Text>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{usuarioActual?.nombre || "Sin nombre"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.buttonSection}>
            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.updateButton, pressed && { opacity: 0.8 }]}
              onPress={() => router.push("/admin-actualizar")}
            >
              <Text style={styles.buttonText}>✏️ Actualizar Perfil</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.createButton, pressed && { opacity: 0.8 }]}
              onPress={() => router.push("/admin-crear")}
            >
              <Text style={styles.buttonText}>➕ Crear Nuevo Usuario</Text>
            </Pressable>
          </View>

          <Pressable style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>❌ Volver</Text>
          </Pressable>
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
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  infoSection: {
    backgroundColor: "#f0f4f8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 24,
  },
  buttonSection: {
    gap: 16,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#2563eb",
  },
  createButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700",
  },
});
