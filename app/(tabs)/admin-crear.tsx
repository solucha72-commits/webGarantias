import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminCrearScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [esAdmin, setEsAdmin] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState("usuario");
  const [mostrarSelectorRol, setMostrarSelectorRol] = useState(false);

  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [resultadoModal, setResultadoModal] = useState<{
    visible: boolean;
    tipo: "exito" | "error";
    mensaje: string;
  }>({ visible: false, tipo: "exito", mensaje: "" });

  useEffect(() => {
    const usuario = sessionStorage.getItem("usuarioActual");
    if (usuario) {
      const parsed = JSON.parse(usuario);
      setEsAdmin(parsed.rol === "admin");
    }
  }, []);

  const mostrarResultado = (tipo: "exito" | "error", mensaje: string) => {
    setResultadoModal({ visible: true, tipo, mensaje });
  };

  const cerrarResultado = () => {
    const fueExito = resultadoModal.tipo === "exito";
    setResultadoModal({ visible: false, tipo: "exito", mensaje: "" });
    if (fueExito) router.back();
  };

  const validarYConfirmar = () => {
    if (!nombre.trim()) { mostrarResultado("error", "El nombre de usuario no puede estar vacío."); return; }
    if (!email.trim()) { mostrarResultado("error", "El email no puede estar vacío."); return; }
    if (!password.trim()) { mostrarResultado("error", "La contraseña no puede estar vacía."); return; }
    if (password !== passwordConfirm) { mostrarResultado("error", "Las contraseñas no coinciden."); return; }
    setModalConfirmar(true);
  };

  const crearUsuario = async () => {
    setModalConfirmar(false);
    setLoading(true);
    try {
      const rolFinal = esAdmin ? rolSeleccionado : "usuario";
      const { error } = await supabase.from("usuarios").insert([{
        nombre: nombre.trim(),
        email: email.trim(),
        contraseña: password,
        activo: true,
        rol: rolFinal,
      }]);

      if (error) {
        mostrarResultado("error", error.message.includes("unique") ? "El nombre de usuario ya existe." : error.message);
        setLoading(false);
        return;
      }

      const n = nombre.trim();
      setNombre(""); setEmail(""); setPassword(""); setPasswordConfirm(""); setRolSeleccionado("usuario");
      mostrarResultado("exito", `Usuario "${n}" creado con rol "${rolFinal}".`);
    } catch (err: any) {
      mostrarResultado("error", err.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { valor: "usuario", label: "👤 Usuario", desc: "Acceso estándar" },
    { valor: "admin", label: "🛡️ Administrador", desc: "Acceso completo, gestiona usuarios" },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
        <View style={styles.screen}>
          <View style={styles.card}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>➕ Crear Nuevo Usuario</Text>
              {esAdmin && (
                <View style={styles.adminIndicator}>
                  <Text style={styles.adminIndicatorText}>🛡️ Modo Administrador</Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de Usuario:</Text>
              <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="nombre de usuario" placeholderTextColor="#9ca3af" editable={!loading} autoCapitalize="none" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email:</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@test.com" placeholderTextColor="#9ca3af" editable={!loading} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña:</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry editable={!loading} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmar Contraseña:</Text>
              <TextInput style={styles.input} value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry editable={!loading} />
            </View>

            {esAdmin && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>🎖️ Rol del nuevo usuario:</Text>
                <Pressable style={({ pressed }) => [styles.rolSelector, pressed && { opacity: 0.85 }]} onPress={() => setMostrarSelectorRol(!mostrarSelectorRol)} disabled={loading}>
                  <Text style={styles.rolSelectorText}>{roles.find((r) => r.valor === rolSeleccionado)?.label}</Text>
                  <Text style={styles.rolSelectorArrow}>{mostrarSelectorRol ? "▲" : "▼"}</Text>
                </Pressable>

                {mostrarSelectorRol && (
                  <View style={styles.rolDropdown}>
                    {roles.map((rol) => {
                      const sel = rolSeleccionado === rol.valor;
                      return (
                        <Pressable key={rol.valor} style={[styles.rolOption, sel && styles.rolOptionSel]} onPress={() => { setRolSeleccionado(rol.valor); setMostrarSelectorRol(false); }}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.rolOptionLabel, sel && { color: "#2563eb" }]}>{rol.label}</Text>
                            <Text style={[styles.rolOptionDesc, sel && { color: "#3b82f6" }]}>{rol.desc}</Text>
                          </View>
                          {sel && <Text style={styles.rolCheck}>✓</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <View style={[styles.rolPreview, rolSeleccionado === "admin" ? styles.rolPreviewWarn : styles.rolPreviewInfo]}>
                  <Text style={[styles.rolPreviewText, rolSeleccionado === "admin" ? { color: "#92400e" } : { color: "#1e40af" }]}>
                    {rolSeleccionado === "admin" ? "⚠️ Tendrá permisos de administrador" : "ℹ️ Tendrá permisos estándar"}
                  </Text>
                </View>
              </View>
            )}

            <Pressable style={({ pressed }) => [styles.btn, styles.btnCreate, loading && { opacity: 0.6 }, pressed && { opacity: 0.85 }]} onPress={validarYConfirmar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnWhite}>✅ Crear Usuario</Text>}
            </Pressable>

            <Pressable style={({ pressed }) => [styles.btn, styles.btnCancel, pressed && { opacity: 0.8 }]} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.btnCancelText}>❌ Cancelar</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.btn, styles.btnBack, pressed && { opacity: 0.8 }]} onPress={() => router.replace("/(tabs)")} disabled={loading}>
              <Text style={styles.btnWhite}>🏠 Volver al Menú Principal</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal confirmar creación */}
      <Modal transparent visible={modalConfirmar} animationType="fade" onRequestClose={() => setModalConfirmar(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalConfirmar(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalIcon}>👤</Text>
            <Text style={styles.modalTitle}>Confirmar Creación</Text>
            <View style={styles.resumen}>
              <View style={styles.resumenRow}><Text style={styles.resumenL}>Nombre:</Text><Text style={styles.resumenV}>{nombre}</Text></View>
              <View style={styles.resumenRow}><Text style={styles.resumenL}>Email:</Text><Text style={styles.resumenV}>{email}</Text></View>
              <View style={styles.resumenRow}>
                <Text style={styles.resumenL}>Rol:</Text>
                <View style={[styles.badge, (esAdmin ? rolSeleccionado : "usuario") === "admin" ? styles.badgeAdmin : styles.badgeUser]}>
                  <Text style={[(esAdmin ? rolSeleccionado : "usuario") === "admin" ? styles.badgeAdminT : styles.badgeUserT]}>{esAdmin ? rolSeleccionado : "usuario"}</Text>
                </View>
              </View>
            </View>
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.modalBtnGray]} onPress={() => setModalConfirmar(false)}><Text style={styles.modalBtnGrayT}>Cancelar</Text></Pressable>
              <Pressable style={[styles.modalBtn, styles.btnCreate]} onPress={crearUsuario}><Text style={styles.btnWhite}>✅ Crear</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal resultado */}
      <Modal transparent visible={resultadoModal.visible} animationType="fade" onRequestClose={cerrarResultado}>
        <Pressable style={styles.overlay} onPress={cerrarResultado}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalIcon}>{resultadoModal.tipo === "exito" ? "✅" : "❌"}</Text>
            <Text style={styles.modalTitle}>{resultadoModal.tipo === "exito" ? "Usuario Creado" : "Error"}</Text>
            <Text style={styles.modalMsg}>{resultadoModal.mensaje}</Text>
            <View style={[styles.modalBtns, { justifyContent: "center" }]}>
              <Pressable style={[styles.modalBtn, resultadoModal.tipo === "exito" ? styles.btnCreate : styles.btnDanger]} onPress={cerrarResultado}>
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
  screen: { width: "100%", maxWidth: 500, paddingHorizontal: 16 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
  headerSection: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  adminIndicator: { backgroundColor: "#fef3c7", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12, borderWidth: 1, borderColor: "#f59e0b" },
  adminIndicatorText: { fontSize: 12, fontWeight: "700", color: "#92400e" },
  formGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  input: { borderWidth: 2, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1f2937", backgroundColor: "#f8fafc" },
  rolSelector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 2, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#f8fafc" },
  rolSelectorText: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  rolSelectorArrow: { fontSize: 12, color: "#64748b" },
  rolDropdown: { marginTop: 8, borderWidth: 2, borderColor: "#e2e8f0", borderRadius: 12, backgroundColor: "#fff", overflow: "hidden" },
  rolOption: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  rolOptionSel: { backgroundColor: "#eff6ff" },
  rolOptionLabel: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  rolOptionDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  rolCheck: { fontSize: 18, fontWeight: "900", color: "#2563eb", marginLeft: 12 },
  rolPreview: { marginTop: 10, borderRadius: 10, padding: 12, borderLeftWidth: 4 },
  rolPreviewWarn: { backgroundColor: "#fef3c7", borderLeftColor: "#f59e0b" },
  rolPreviewInfo: { backgroundColor: "#eff6ff", borderLeftColor: "#3b82f6" },
  rolPreviewText: { fontSize: 13, fontWeight: "600" },
  btn: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  btnCreate: { backgroundColor: "#10b981" },
  btnCancel: { backgroundColor: "#fee2e2", borderWidth: 2, borderColor: "#ef4444" },
  btnCancelText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
  btnBack: { backgroundColor: "#6b7280" },
  btnDanger: { backgroundColor: "#ef4444" },
  btnWhite: { color: "#fff", fontSize: 15, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modal: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 420, alignItems: "center" },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginBottom: 12, textAlign: "center" },
  modalMsg: { fontSize: 15, color: "#475569", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  resumen: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 16, marginBottom: 24, width: "100%", borderWidth: 1, borderColor: "#e2e8f0", gap: 12 },
  resumenRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resumenL: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  resumenV: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  badge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  badgeAdmin: { backgroundColor: "#fef3c7" },
  badgeUser: { backgroundColor: "#e0e7ff" },
  badgeAdminT: { fontSize: 12, fontWeight: "700", color: "#92400e", textTransform: "uppercase" },
  badgeUserT: { fontSize: 12, fontWeight: "700", color: "#3730a3", textTransform: "uppercase" },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalBtnGray: { backgroundColor: "#f1f5f9", borderWidth: 2, borderColor: "#e2e8f0" },
  modalBtnGrayT: { fontSize: 15, fontWeight: "700", color: "#64748b" },
});
