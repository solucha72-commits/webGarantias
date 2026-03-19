import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminEliminarScreen() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  // Modales
  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<any>(null);
  const [resultadoModal, setResultadoModal] = useState<{
    visible: boolean;
    tipo: "exito" | "error";
    mensaje: string;
  }>({ visible: false, tipo: "exito", mensaje: "" });

  useEffect(() => {
    const usuario = sessionStorage.getItem("usuarioActual");
    if (usuario) {
      const parsed = JSON.parse(usuario);
      setUsuarioActual(parsed);

      if (parsed.rol !== "admin") {
        // No es admin, volver atrás
        router.back();
        return;
      }

      cargarUsuarios();
    }
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, email, rol, activo")
        .order("nombre", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setUsuarios(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const mostrarResultado = (tipo: "exito" | "error", mensaje: string) => {
    setResultadoModal({ visible: true, tipo, mensaje });
  };

  const cerrarResultado = () => {
    setResultadoModal({ visible: false, tipo: "exito", mensaje: "" });
  };

  const confirmarEliminar = (usuario: any) => {
    if (usuario.id === usuarioActual?.id) {
      mostrarResultado("error", "No puedes eliminarte a ti mismo.");
      return;
    }
    setUsuarioAEliminar(usuario);
    setModalEliminar(true);
  };

  const cancelarEliminar = () => {
    setModalEliminar(false);
    setUsuarioAEliminar(null);
  };

  const ejecutarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setModalEliminar(false);
    setEliminando(usuarioAEliminar.id);

    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", usuarioAEliminar.id);

      if (error) {
        mostrarResultado("error", `No se pudo eliminar.\n${error.message || "Revisa las políticas RLS."}`);
      } else {
        mostrarResultado("exito", `Usuario "${usuarioAEliminar.nombre}" eliminado correctamente.`);
        cargarUsuarios();
      }
    } catch (err: any) {
      mostrarResultado("error", err.message || "Error al eliminar");
    } finally {
      setEliminando(null);
      setUsuarioAEliminar(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
        <View style={styles.screen}>
          <View style={styles.card}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>🗑️ Eliminar Usuarios</Text>
              <View style={styles.adminIndicator}>
                <Text style={styles.adminIndicatorText}>🛡️ Solo Administradores</Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Las eliminaciones son permanentes e irreversibles. Asegúrate de seleccionar el usuario correcto.
              </Text>
            </View>

            {cargando ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#2563eb" size="large" />
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
              </View>
            ) : usuarios.length === 0 ? (
              <Text style={styles.emptyText}>No hay usuarios registrados</Text>
            ) : (
              <View style={styles.userList}>
                {usuarios.map((usuario) => {
                  const esMismo = usuario.id === usuarioActual?.id;
                  const estaEliminando = eliminando === usuario.id;

                  return (
                    <View key={usuario.id} style={styles.userItem}>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                          {usuario.nombre}
                          {esMismo ? " (Tú)" : ""}
                        </Text>
                        <Text style={styles.userEmail}>{usuario.email || "Sin email"}</Text>
                        <View style={styles.userMeta}>
                          <View style={[styles.rolBadge, usuario.rol === "admin" ? styles.rolBadgeAdmin : styles.rolBadgeUser]}>
                            <Text style={[styles.rolBadgeText, usuario.rol === "admin" ? { color: "#92400e" } : { color: "#3730a3" }]}>
                              {usuario.rol || "usuario"}
                            </Text>
                          </View>
                          <View style={[styles.activoBadge, usuario.activo ? styles.activoSi : styles.activoNo]}>
                            <Text style={[styles.activoText, usuario.activo ? { color: "#065f46" } : { color: "#991b1b" }]}>
                              {usuario.activo ? "Activo" : "Inactivo"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Pressable
                        style={({ pressed }) => [
                          styles.deleteBtn,
                          esMismo && { opacity: 0.3 },
                          pressed && !esMismo && { opacity: 0.7 },
                        ]}
                        onPress={() => confirmarEliminar(usuario)}
                        disabled={esMismo || estaEliminando}
                      >
                        {estaEliminando ? (
                          <ActivityIndicator color="#ef4444" size="small" />
                        ) : (
                          <Text style={styles.deleteBtnText}>🗑️</Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.8 }]}
              onPress={cargarUsuarios}
              disabled={cargando}
            >
              <Text style={styles.refreshBtnText}>🔄 Actualizar Lista</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnCancel, { marginTop: 20 }, pressed && { opacity: 0.8 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.btnCancelText}>❌ Volver</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnBack, pressed && { opacity: 0.8 }]}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.btnWhite}>🏠 Volver al Menú Principal</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal confirmar eliminación */}
      <Modal transparent visible={modalEliminar} animationType="fade" onRequestClose={cancelarEliminar}>
        <Pressable style={styles.overlay} onPress={cancelarEliminar}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Eliminar Usuario</Text>
            <Text style={styles.modalMsg}>
              ¿Estás seguro de que deseas eliminar a{" "}
              <Text style={{ fontWeight: "800", color: "#0f172a" }}>"{usuarioAEliminar?.nombre}"</Text>?
            </Text>

            <View style={styles.modalWarning}>
              <Text style={styles.modalWarningText}>
                Esta acción es irreversible. Se eliminarán todos los datos asociados a este usuario.
              </Text>
            </View>

            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.modalBtnGray]} onPress={cancelarEliminar}>
                <Text style={styles.modalBtnGrayT}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.btnDanger]} onPress={ejecutarEliminar}>
                <Text style={styles.btnWhite}>🗑️ Eliminar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal resultado */}
      <Modal transparent visible={resultadoModal.visible} animationType="fade" onRequestClose={cerrarResultado}>
        <Pressable style={styles.overlay} onPress={cerrarResultado}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalIcon}>{resultadoModal.tipo === "exito" ? "✅" : "❌"}</Text>
            <Text style={styles.modalTitle}>{resultadoModal.tipo === "exito" ? "Usuario Eliminado" : "Error"}</Text>
            <Text style={styles.modalMsg}>{resultadoModal.mensaje}</Text>
            <View style={[styles.modalBtns, { justifyContent: "center" }]}>
              <Pressable style={[styles.modalBtn, resultadoModal.tipo === "exito" ? styles.btnSuccess : styles.btnDanger]} onPress={cerrarResultado}>
                <Text style={styles.btnWhite}>Aceptar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainBackground: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 30 },
  screen: { width: "100%", maxWidth: 700, paddingHorizontal: 16 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
  headerSection: { alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  adminIndicator: { backgroundColor: "#fef3c7", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12, borderWidth: 1, borderColor: "#f59e0b" },
  adminIndicatorText: { fontSize: 12, fontWeight: "700", color: "#92400e" },
  warningBox: { backgroundColor: "#fef3c7", borderRadius: 12, padding: 14, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: "#f59e0b" },
  warningText: { fontSize: 13, color: "#92400e", fontWeight: "600", lineHeight: 20 },
  loadingContainer: { alignItems: "center", paddingVertical: 24, gap: 12 },
  loadingText: { fontSize: 14, color: "#64748b" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center", paddingVertical: 20 },
  userList: { gap: 12 },
  userItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  userEmail: { fontSize: 13, color: "#64748b", marginTop: 2 },
  userMeta: { flexDirection: "row", gap: 8, marginTop: 8 },
  rolBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  rolBadgeAdmin: { backgroundColor: "#fef3c7" },
  rolBadgeUser: { backgroundColor: "#e0e7ff" },
  rolBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  activoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  activoSi: { backgroundColor: "#d1fae5" },
  activoNo: { backgroundColor: "#fee2e2" },
  activoText: { fontSize: 11, fontWeight: "700" },
  deleteBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center", marginLeft: 12, borderWidth: 1, borderColor: "#fecaca" },
  deleteBtnText: { fontSize: 20 },
  refreshBtn: { paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: "#e0e7ff", marginTop: 20 },
  refreshBtnText: { color: "#3730a3", fontSize: 14, fontWeight: "700" },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  btnCancel: { backgroundColor: "#fee2e2", borderWidth: 2, borderColor: "#ef4444" },
  btnCancelText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
  btnBack: { backgroundColor: "#6b7280" },
  btnDanger: { backgroundColor: "#ef4444" },
  btnSuccess: { backgroundColor: "#10b981" },
  btnWhite: { color: "#fff", fontSize: 15, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modal: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 420, alignItems: "center" },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginBottom: 12, textAlign: "center" },
  modalMsg: { fontSize: 15, color: "#475569", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  modalWarning: { backgroundColor: "#fef3c7", borderRadius: 12, padding: 14, marginBottom: 24, width: "100%", borderLeftWidth: 4, borderLeftColor: "#f59e0b" },
  modalWarningText: { fontSize: 13, color: "#92400e", fontWeight: "600", lineHeight: 20 },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalBtnGray: { backgroundColor: "#f1f5f9", borderWidth: 2, borderColor: "#e2e8f0" },
  modalBtnGrayT: { fontSize: 15, fontWeight: "700", color: "#64748b" },
});
