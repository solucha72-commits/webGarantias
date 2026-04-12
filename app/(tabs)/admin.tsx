import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function AdminScreen() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [esGerente, setEsGerente] = useState(false);

  useEffect(() => {
    const usuario = sessionStorage.getItem("usuarioActual");
    if (usuario) {
      const parsed = JSON.parse(usuario);
      setUsuarioActual(parsed);
      setEsAdmin(parsed.rol === "admin");
      setEsGerente(parsed.rol === "gerente");
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>👥 Gestión de Usuarios</Text>
            {esAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>🛡️ Administrador</Text>
              </View>
            )}
            {esGerente && (
              <View style={styles.gerenteBadge}>
                <Text style={styles.gerenteBadgeText}>👔 Gerente</Text>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Usuario actual:</Text>
            <Text style={styles.infoValue}>{usuarioActual?.nombre || "Cargando..."}</Text>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{usuarioActual?.email || "Sin email"}</Text>
            <Text style={styles.infoLabel}>Rol:</Text>
            <Text style={[styles.infoValue, (esAdmin || esGerente) && styles.adminRolText]}>
              {usuarioActual?.rol || "usuario"}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.menuTitle}>Opciones disponibles:</Text>

          <View style={styles.buttonSection}>
            {/* 1. CREAR USUARIO — todos */}
            <Pressable
              style={({ pressed }) => [styles.menuButton, styles.createButton, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/admin-crear")}
            >
              <View style={styles.menuButtonContent}>
                <Text style={styles.menuButtonIcon}>➕</Text>
                <View style={styles.menuButtonTextContainer}>
                  <Text style={styles.menuButtonTitle}>Crear Nuevo Usuario</Text>
                  <Text style={styles.menuButtonDesc}>
                    {esAdmin
                      ? "Crear usuario con rol admin o usuario"
                      : "Crear usuario con rol usuario"}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* 2. EDITAR USUARIO — todos */}
            <Pressable
              style={({ pressed }) => [styles.menuButton, styles.editButton, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/admin-actualizar")}
            >
              <View style={styles.menuButtonContent}>
                <Text style={styles.menuButtonIcon}>✏️</Text>
                <View style={styles.menuButtonTextContainer}>
                  <Text style={styles.menuButtonTitle}>Editar Usuario</Text>
                  <Text style={styles.menuButtonDesc}>
                    {esAdmin
                      ? "Editar nombre, email, contraseña y rol"
                      : "Editar nombre, email y contraseña"}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* 3. ELIMINAR USUARIOS — solo admin */}
            {esAdmin && (
              <Pressable
                style={({ pressed }) => [styles.menuButton, styles.deleteButton, pressed && { opacity: 0.85 }]}
                onPress={() => router.push("/admin-eliminar")}
              >
                <View style={styles.menuButtonContent}>
                  <Text style={styles.menuButtonIcon}>🗑️</Text>
                  <View style={styles.menuButtonTextContainer}>
                    <Text style={styles.menuButtonTitle}>Eliminar Usuarios</Text>
                    <Text style={styles.menuButtonDesc}>
                      Eliminar usuarios del sistema
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}

            {/* 4. CONTROL DE ACCESOS — admin y gerente */}
            {(esAdmin || esGerente) && (
              <Pressable
                style={({ pressed }) => [styles.menuButton, styles.auditButton, pressed && { opacity: 0.85 }]}
                onPress={() => router.push("/control-accesos")}
              >
                <View style={styles.menuButtonContent}>
                  <Text style={styles.menuButtonIcon}>🔐</Text>
                  <View style={styles.menuButtonTextContainer}>
                    <Text style={styles.menuButtonTitle}>Control de Accesos</Text>
                    <Text style={styles.menuButtonDesc}>
                      Monitorea todas las operaciones en BD
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>❌ Volver</Text>
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
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  adminBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  adminBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },
  gerenteBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  gerenteBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e40af",
  },
  infoSection: {
    backgroundColor: "#f0f4f8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
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
  adminRolText: {
    color: "#d97706",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 24,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 16,
  },
  buttonSection: {
    gap: 14,
    marginBottom: 24,
  },
  menuButton: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  createButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  editButton: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  auditButton: {
    backgroundColor: "#f0f9ff",
    borderColor: "#7dd3fc",
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButtonIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuButtonTextContainer: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  menuButtonDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  backButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700",
  },
});
