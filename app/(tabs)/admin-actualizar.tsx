import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminActualizarScreen() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [esAdmin, setEsAdmin] = useState(false);

  // Lista de usuarios (admin)
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("usuario");
  const [mostrarSelectorRol, setMostrarSelectorRol] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Modales
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [resultadoModal, setResultadoModal] = useState<{ visible: boolean; tipo: "exito" | "error"; mensaje: string }>({
    visible: false, tipo: "exito", mensaje: "",
  });

  useEffect(() => {
    const usuario = sessionStorage.getItem("usuarioActual");
    if (usuario) {
      const parsed = JSON.parse(usuario);
      setUsuarioActual(parsed);
      const admin = parsed.rol === "admin";
      setEsAdmin(admin);

      if (admin) {
        cargarUsuarios();
      } else {
        // No es admin: cargar su propio perfil
        cargarPerfilPropio(parsed.id);
      }
    }
  }, []);

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, email, rol, activo")
        .order("nombre", { ascending: true });
      if (!error) setUsuarios(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoUsuarios(false);
      setCargandoDatos(false);
    }
  };

  const cargarPerfilPropio = async (id: number) => {
    try {
      const { data } = await supabase.from("usuarios").select("*").eq("id", id).single();
      if (data) {
        setNombre(data.nombre || "");
        setEmail(data.email || "");
        setRolSeleccionado(data.rol || "usuario");
        setUsuarioSeleccionado(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoDatos(false);
    }
  };

  const seleccionarUsuario = async (usuario: any) => {
    try {
      const { data } = await supabase.from("usuarios").select("*").eq("id", usuario.id).single();
      if (data) {
        setUsuarioSeleccionado(data);
        setNombre(data.nombre || "");
        setEmail(data.email || "");
        setRolSeleccionado(data.rol || "usuario");
        setPasswordActual("");
        setPasswordNueva("");
        setPasswordConfirm("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const volverALista = () => {
    setUsuarioSeleccionado(null);
    setNombre("");
    setEmail("");
    setPasswordActual("");
    setPasswordNueva("");
    setPasswordConfirm("");
    setRolSeleccionado("usuario");
    cargarUsuarios();
  };

  const mostrarResultado = (tipo: "exito" | "error", mensaje: string) => {
    setResultadoModal({ visible: true, tipo, mensaje });
  };

  const cerrarResultado = () => {
    const fueExito = resultadoModal.tipo === "exito";
    setResultadoModal({ visible: false, tipo: "exito", mensaje: "" });
    if (fueExito) {
      if (esAdmin) {
        volverALista();
      } else {
        router.back();
      }
    }
  };

  const validarYConfirmar = async () => {
    if (!nombre.trim()) { mostrarResultado("error", "El nombre no puede estar vacío."); return; }
    if (!email.trim()) { mostrarResultado("error", "El email no puede estar vacío."); return; }

    if (passwordNueva || passwordActual) {
      if (!esAdmin && !passwordActual) {
        mostrarResultado("error", "Debes ingresar tu contraseña actual para cambiarla.");
        return;
      }
      if (passwordNueva && passwordNueva !== passwordConfirm) {
        mostrarResultado("error", "Las contraseñas nuevas no coinciden.");
        return;
      }
      // Verificar contraseña actual si no es admin
      if (!esAdmin && passwordActual) {
        const { data } = await supabase.from("usuarios").select("contraseña").eq("id", usuarioSeleccionado.id).single();
        if (!data || data.contraseña !== passwordActual) {
          mostrarResultado("error", "Contraseña actual incorrecta.");
          return;
        }
      }
    }

    setModalConfirmar(true);
  };

  const guardarCambios = async () => {
    setModalConfirmar(false);
    setLoading(true);
    try {
      const updates: any = {
        nombre: nombre.trim(),
        email: email.trim(),
      };

      if (esAdmin) {
        updates.rol = rolSeleccionado;
      }

      if (passwordNueva) {
        updates.contraseña = passwordNueva;
      }

      const { error } = await supabase.from("usuarios").update(updates).eq("id", usuarioSeleccionado.id);

      if (error) {
        mostrarResultado("error", error.message);
        setLoading(false);
        return;
      }

      // Si editó su propio perfil, actualizar sessionStorage
      if (usuarioSeleccionado.id === usuarioActual?.id) {
        const actualizado = { ...usuarioActual, nombre: nombre.trim(), email: email.trim() };
        if (esAdmin) actualizado.rol = rolSeleccionado;
        sessionStorage.setItem("usuarioActual", JSON.stringify(actualizado));
      }

      mostrarResultado("exito", `Usuario "${nombre.trim()}" actualizado correctamente.`);
    } catch (err: any) {
      mostrarResultado("error", err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { valor: "usuario", label: "👤 Usuario", desc: "Acceso estándar" },
    { valor: "admin", label: "🛡️ Administrador", desc: "Acceso completo" },
  ];

  if (cargandoDatos) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
        <View style={styles.screen}>
          <View style={styles.card}>
            <ActivityIndicator color="#2563eb" size="large" />
            <Text style={{ textAlign: "center", marginTop: 12, color: "#64748b" }}>Cargando...</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── ADMIN: mostrar lista de usuarios para seleccionar ──
  if (esAdmin && !usuarioSeleccionado) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
          <View style={styles.screen}>
            <View style={styles.card}>
              <View style={styles.headerSection}>
                <Text style={styles.title}>✏️ Editar Usuario</Text>
                <View style={styles.adminIndicator}>
                  <Text style={styles.adminIndicatorText}>🛡️ Modo Administrador</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>Selecciona un usuario para editar:</Text>

              {cargandoUsuarios ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <ActivityIndicator color="#2563eb" size="large" />
                </View>
              ) : (
                <View style={styles.userList}>
                  {usuarios.map((u) => (
                    <Pressable
                      key={u.id}
                      style={({ pressed }) => [styles.userItem, pressed && { opacity: 0.85 }]}
                      onPress={() => seleccionarUsuario(u)}
                    >
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                          {u.nombre}
                          {u.id === usuarioActual?.id ? " (Tú)" : ""}
                        </Text>
                        <Text style={styles.userEmail}>{u.email || "Sin email"}</Text>
                        <View style={styles.userMeta}>
                          <View style={[styles.rolBadge, u.rol === "admin" ? styles.rolBadgeAdmin : styles.rolBadgeUser]}>
                            <Text style={[styles.rolBadgeText, u.rol === "admin" ? { color: "#92400e" } : { color: "#3730a3" }]}>{u.rol || "usuario"}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={{ fontSize: 20, color: "#2563eb" }}>✏️</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Pressable style={({ pressed }) => [styles.btn, styles.btnCancel, { marginTop: 20 }, pressed && { opacity: 0.8 }]} onPress={() => router.back()}>
                <Text style={styles.btnCancelText}>❌ Volver</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── FORMULARIO DE EDICIÓN ──
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainBackground}>
        <View style={styles.screen}>
          <View style={styles.card}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>✏️ Editar Usuario</Text>
              {esAdmin && (
                <View style={styles.adminIndicator}>
                  <Text style={styles.adminIndicatorText}>🛡️ Editando: {usuarioSeleccionado?.nombre}</Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de Usuario:</Text>
              <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="nombre" placeholderTextColor="#9ca3af" editable={!loading} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email:</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@test.com" placeholderTextColor="#9ca3af" editable={!loading} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              {esAdmin ? "Cambiar Contraseña (opcional)" : "Cambiar Contraseña (opcional)"}
            </Text>

            {!esAdmin && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contraseña Actual:</Text>
                <TextInput style={styles.input} value={passwordActual} onChangeText={setPasswordActual} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry editable={!loading} />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nueva Contraseña:</Text>
              <TextInput style={styles.input} value={passwordNueva} onChangeText={setPasswordNueva} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry editable={!loading} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmar Contraseña:</Text>
              <TextInput style={styles.input} value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry editable={!loading} />
            </View>

            {/* Selector de Rol — solo admin */}
            {esAdmin && (
              <>
                <View style={styles.divider} />
                <View style={styles.formGroup}>
                  <Text style={styles.label}>🎖️ Rol:</Text>
                  <Pressable style={({ pressed }) => [styles.rolSelector, pressed && { opacity: 0.85 }]} onPress={() => setMostrarSelectorRol(!mostrarSelectorRol)} disabled={loading}>
                    <Text style={styles.rolSelectorText}>{roles.find((r) => r.valor === rolSeleccionado)?.label}</Text>
                    <Text style={{ fontSize: 12, color: "#64748b" }}>{mostrarSelectorRol ? "▲" : "▼"}</Text>
                  </Pressable>

                  {mostrarSelectorRol && (
                    <View style={styles.rolDropdown}>
                      {roles.map((rol) => {
                        const sel = rolSeleccionado === rol.valor;
                        return (
                          <Pressable key={rol.valor} style={[styles.rolOption, sel && { backgroundColor: "#eff6ff" }]} onPress={() => { setRolSeleccionado(rol.valor); setMostrarSelectorRol(false); }}>
                            <View style={{ flex: 1 }}>
                              <Text style={[{ fontSize: 15, fontWeight: "700", color: "#0f172a" }, sel && { color: "#2563eb" }]}>{rol.label}</Text>
                              <Text style={[{ fontSize: 12, color: "#64748b", marginTop: 2 }, sel && { color: "#3b82f6" }]}>{rol.desc}</Text>
                            </View>
                            {sel && <Text style={{ fontSize: 18, fontWeight: "900", color: "#2563eb" }}>✓</Text>}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              </>
            )}

            <Pressable style={({ pressed }) => [styles.btn, styles.btnSave, loading && { opacity: 0.6 }, pressed && { opacity: 0.85 }]} onPress={validarYConfirmar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnWhite}>✅ Guardar Cambios</Text>}
            </Pressable>

            {esAdmin ? (
              <Pressable style={({ pressed }) => [styles.btn, styles.btnCancel, pressed && { opacity: 0.8 }]} onPress={volverALista}>
                <Text style={styles.btnCancelText}>← Volver a la lista</Text>
              </Pressable>
            ) : (
              <Pressable style={({ pressed }) => [styles.btn, styles.btnCancel, pressed && { opacity: 0.8 }]} onPress={() => router.back()}>
                <Text style={styles.btnCancelText}>❌ Cancelar</Text>
              </Pressable>
            )}

            <Pressable style={({ pressed }) => [styles.btn, styles.btnBack, pressed && { opacity: 0.8 }]} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.btnWhite}>🏠 Volver al Menú Principal</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal confirmar */}
      <Modal transparent visible={modalConfirmar} animationType="fade" onRequestClose={() => setModalConfirmar(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalConfirmar(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalIcon}>✏️</Text>
            <Text style={styles.modalTitle}>Confirmar Cambios</Text>
            <View style={styles.resumen}>
              <View style={styles.resumenRow}><Text style={styles.resumenL}>Nombre:</Text><Text style={styles.resumenV}>{nombre}</Text></View>
              <View style={styles.resumenRow}><Text style={styles.resumenL}>Email:</Text><Text style={styles.resumenV}>{email}</Text></View>
              {esAdmin && (
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenL}>Rol:</Text>
                  <View style={[styles.rolBadge, rolSeleccionado === "admin" ? styles.rolBadgeAdmin : styles.rolBadgeUser]}>
                    <Text style={[styles.rolBadgeText, rolSeleccionado === "admin" ? { color: "#92400e" } : { color: "#3730a3" }]}>{rolSeleccionado}</Text>
                  </View>
                </View>
              )}
              {passwordNueva ? (
                <View style={styles.resumenRow}><Text style={styles.resumenL}>Contraseña:</Text><Text style={styles.resumenV}>Será actualizada</Text></View>
              ) : null}
            </View>
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.modalBtnGray]} onPress={() => setModalConfirmar(false)}><Text style={styles.modalBtnGrayT}>Cancelar</Text></Pressable>
              <Pressable style={[styles.modalBtn, styles.btnSave]} onPress={guardarCambios}><Text style={styles.btnWhite}>✅ Guardar</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal resultado */}
      <Modal transparent visible={resultadoModal.visible} animationType="fade" onRequestClose={cerrarResultado}>
        <Pressable style={styles.overlay} onPress={cerrarResultado}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalIcon}>{resultadoModal.tipo === "exito" ? "✅" : "❌"}</Text>
            <Text style={styles.modalTitle}>{resultadoModal.tipo === "exito" ? "Cambios Guardados" : "Error"}</Text>
            <Text style={styles.modalMsg}>{resultadoModal.mensaje}</Text>
            <View style={[styles.modalBtns, { justifyContent: "center" }]}>
              <Pressable style={[styles.modalBtn, resultadoModal.tipo === "exito" ? styles.btnSave : styles.btnDanger]} onPress={cerrarResultado}>
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
  screen: { width: "100%", maxWidth: 600, paddingHorizontal: 16 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
  headerSection: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  adminIndicator: { backgroundColor: "#fef3c7", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12, borderWidth: 1, borderColor: "#f59e0b" },
  adminIndicatorText: { fontSize: 12, fontWeight: "700", color: "#92400e" },
  subtitle: { fontSize: 15, fontWeight: "600", color: "#475569", marginBottom: 16 },
  formGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  input: { borderWidth: 2, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1f2937", backgroundColor: "#f8fafc" },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 14 },
  userList: { gap: 10 },
  userItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  userEmail: { fontSize: 13, color: "#64748b", marginTop: 2 },
  userMeta: { flexDirection: "row", gap: 8, marginTop: 8 },
  rolBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  rolBadgeAdmin: { backgroundColor: "#fef3c7" },
  rolBadgeUser: { backgroundColor: "#e0e7ff" },
  rolBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  rolSelector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 2, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#f8fafc" },
  rolSelectorText: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  rolDropdown: { marginTop: 8, borderWidth: 2, borderColor: "#e2e8f0", borderRadius: 12, backgroundColor: "#fff", overflow: "hidden" },
  rolOption: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  btn: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  btnSave: { backgroundColor: "#2563eb" },
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
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalBtnGray: { backgroundColor: "#f1f5f9", borderWidth: 2, borderColor: "#e2e8f0" },
  modalBtnGrayT: { fontSize: 15, fontWeight: "700", color: "#64748b" },
});
