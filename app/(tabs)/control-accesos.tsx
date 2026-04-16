import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, FlatList, Modal, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import accesoService, { AuditoriaLog } from "@/lib/accesoService";

export default function ControlAccesos() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [accesos, setAccesos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroTabla, setFiltroTabla] = useState<"" | "usuarios" | "garantias">("");
  const [filtroOperacion, setFiltroOperacion] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [accesoSeleccionado, setAccesoSeleccionado] = useState<any>(null);

  useEffect(() => {
    const usuarioActual = sessionStorage.getItem("usuarioActual");
    if (usuarioActual) {
      const parsed = JSON.parse(usuarioActual);
      setUsuario(parsed);
      
      if (parsed.rol === "admin" || parsed.rol === "gerente") {
        cargarAccesos();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const cargarAccesos = async () => {
    try {
      setLoading(true);
      const datos = await accesoService.obtenerAuditoria({ limite: 500 });
      setAccesos(datos);

      const stats = await accesoService.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const datos = await accesoService.obtenerAuditoria({
        tabla: filtroTabla || undefined,
        operacion: filtroOperacion || undefined,
        fecha: filtroDesde || undefined,
        limite: 500,
      });
      setAccesos(datos);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroDesde("");
    setFiltroHasta("");
    setFiltroTabla("");
    setFiltroOperacion("");
    cargarAccesos();
  };

  const verDetalles = (acceso: any) => {
    setAccesoSeleccionado(acceso);
    setModalVisible(true);
  };

  const obtenerIconoOperacion = (op: string) => {
    switch (op) {
      case "INSERT":
        return "➕";
      case "UPDATE":
        return "✏️";
      case "DELETE":
        return "🗑️";
      case "LOGIN":
        return "🔐";
      default:
        return "📋";
    }
  };

  const abrirCalendario = (campo: "desde" | "hasta") => {
    const fechaActual = campo === "desde" ? filtroDesde : filtroHasta;
    const fecha = prompt(`Ingresa fecha (DD/MM/YYYY):`, fechaActual);
    if (fecha) {
      // Validar formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        if (campo === "desde") {
          setFiltroDesde(fecha);
        } else {
          setFiltroHasta(fecha);
        }
      } else {
        alert("Formato inválido. Usa DD/MM/YYYY");
      }
    }
  };

  if (!usuario) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </ScrollView>
    );
  }

  if (usuario.rol !== "admin" && usuario.rol !== "gerente") {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.errorTitle}>❌ Acceso Denegado</Text>
          <Text style={styles.errorText}>Solo admins y gerentes</Text>
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>← Volver</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔐 Control de Accesos</Text>
        <Text style={styles.subtitle}>Monitorea todas las operaciones en BD</Text>

        {/* ESTADÍSTICAS - DOS LÍNEAS */}
        {estadisticas && (
          <View>
            {/* LÍNEA 1: Total y Usuarios */}
            <View style={styles.statsRow}>
              <View style={styles.statCardCompact}>
                <Text style={styles.statIcon}>📊</Text>
                <View style={styles.statCompactContent}>
                  <Text style={styles.statCompactValue}>{estadisticas.total}</Text>
                  <Text style={styles.statCompactLabel}>Total Operaciones</Text>
                </View>
              </View>

              <View style={styles.statCardCompact}>
                <Text style={styles.statIcon}>👥</Text>
                <View style={styles.statCompactContent}>
                  <Text style={styles.statCompactValue}>{estadisticas.usuariosUnicos}</Text>
                  <Text style={styles.statCompactLabel}>Usuarios Únicos</Text>
                </View>
              </View>
            </View>

            {/* LÍNEA 2: Inserciones, Modificaciones, Eliminaciones */}
            <View style={styles.statsRow}>
              <View style={styles.statCardCompact}>
                <Text style={styles.statIcon}>➕</Text>
                <View style={styles.statCompactContent}>
                  <Text style={styles.statCompactValue}>
                    {estadisticas.porOperacion["INSERT"] || 0}
                  </Text>
                  <Text style={styles.statCompactLabel}>Inserciones</Text>
                </View>
              </View>

              <View style={styles.statCardCompact}>
                <Text style={styles.statIcon}>✏️</Text>
                <View style={styles.statCompactContent}>
                  <Text style={styles.statCompactValue}>
                    {estadisticas.porOperacion["UPDATE"] || 0}
                  </Text>
                  <Text style={styles.statCompactLabel}>Modificaciones</Text>
                </View>
              </View>

              <View style={styles.statCardCompact}>
                <Text style={styles.statIcon}>🗑️</Text>
                <View style={styles.statCompactContent}>
                  <Text style={styles.statCompactValue}>
                    {estadisticas.porOperacion["DELETE"] || 0}
                  </Text>
                  <Text style={styles.statCompactLabel}>Eliminaciones</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* FILTROS EN UNA LÍNEA */}
        <Text style={styles.filtroTitle}>🔍 Filtros</Text>
        
        <View style={styles.filtrosRow}>
          {/* Desde y Hasta en la MISMA línea */}
          <View style={styles.filtroGroupDouble}>
            <View style={styles.filtroGroupSmall}>
              <Text style={styles.filtroLabel}>Desde</Text>
              <Pressable style={styles.filtroInputBtn} onPress={() => abrirCalendario("desde")}>
                <Text style={styles.filtroInputText}>
                  {filtroDesde ? "📅 " + filtroDesde : "📅 DD/MM/YYYY"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.filtroGroupSmall}>
              <Text style={styles.filtroLabel}>Hasta</Text>
              <Pressable style={styles.filtroInputBtn} onPress={() => abrirCalendario("hasta")}>
                <Text style={styles.filtroInputText}>
                  {filtroHasta ? "📅 " + filtroHasta : "📅 DD/MM/YYYY"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filtroGroupSmall}>
            <Text style={styles.filtroLabel}>Tabla</Text>
            <View style={styles.filterButtonsCompact}>
              <Pressable
                style={[styles.filterBtnSmall, filtroTabla === "" && styles.filterBtnSmallActive]}
                onPress={() => setFiltroTabla("")}
              >
                <Text style={filtroTabla === "" ? styles.filterBtnTextActive : styles.filterBtnText}>Todas</Text>
              </Pressable>
              <Pressable
                style={[styles.filterBtnSmall, filtroTabla === "usuarios" && styles.filterBtnSmallActive]}
                onPress={() => setFiltroTabla("usuarios")}
              >
                <Text style={filtroTabla === "usuarios" ? styles.filterBtnTextActive : styles.filterBtnText}>Usuarios</Text>
              </Pressable>
              <Pressable
                style={[styles.filterBtnSmall, filtroTabla === "garantias" && styles.filterBtnSmallActive]}
                onPress={() => setFiltroTabla("garantias")}
              >
                <Text style={filtroTabla === "garantias" ? styles.filterBtnTextActive : styles.filterBtnText}>Garantías</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filtroGroupSmall}>
            <Text style={styles.filtroLabel}>Operación</Text>
            <View style={styles.filterButtonsCompact}>
              {["INSERT", "UPDATE", "DELETE"].map((op) => (
                <Pressable
                  key={op}
                  style={[styles.filterBtnSmall, filtroOperacion === op && styles.filterBtnSmallActive]}
                  onPress={() => setFiltroOperacion(filtroOperacion === op ? "" : op)}
                >
                  <Text style={filtroOperacion === op ? styles.filterBtnTextActive : styles.filterBtnText}>
                    {obtenerIconoOperacion(op)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.filtroButtonsContainer}>
          <Pressable style={styles.btnAplicar} onPress={aplicarFiltros}>
            <Text style={styles.btnAplicarText}>🔎 Aplicar</Text>
          </Pressable>
          <Pressable style={styles.btnLimpiar} onPress={limpiarFiltros}>
            <Text style={styles.btnLimpiarText}>🔄 Limpiar</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* TABLA */}
        <Text style={styles.tablaTitle}>📋 Accesos ({accesos.length})</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : accesos.length === 0 ? (
          <Text style={styles.emptyText}>📭 Sin registros</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={accesos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable style={styles.accesoItem} onPress={() => verDetalles(item)}>
                <View style={styles.accesoRow}>
                  <Text style={styles.accesoUsuario}>👤 {item.usuario_nombre}</Text>
                  <Text style={styles.accesoOperacion}>
                    {obtenerIconoOperacion(item.operacion)} {item.operacion}
                  </Text>
                  <Text style={styles.accesoTiempo}>{item.fecha_acceso} {item.hora_acceso}</Text>
                </View>
                <Text style={styles.accesoDetalles}>{item.detalles || "-"}</Text>
              </Pressable>
            )}
          />
        )}

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>← Volver</Text>
        </Pressable>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            {accesoSeleccionado && (
              <ScrollView>
                <Text style={styles.modalTitle}>📋 Detalles</Text>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>ID</Text>
                  <Text style={styles.modalValue}>#{accesoSeleccionado.id}</Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Usuario</Text>
                  <Text style={styles.modalValue}>{accesoSeleccionado.usuario_nombre}</Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Operación</Text>
                  <Text style={styles.modalValue}>{accesoSeleccionado.operacion}</Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Tabla</Text>
                  <Text style={styles.modalValue}>{accesoSeleccionado.tabla_afectada}</Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Fecha y Hora</Text>
                  <Text style={styles.modalValue}>
                    {accesoSeleccionado.fecha_acceso} {accesoSeleccionado.hora_acceso}
                  </Text>
                </View>

                {accesoSeleccionado.detalles && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Detalles</Text>
                    <Text style={styles.modalValue}>{accesoSeleccionado.detalles}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748b", marginBottom: 20 },

  // ESTADÍSTICAS
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCardCompact: { flex: 1, flexDirection: "row", backgroundColor: "#f8fafc", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", gap: 8 },
  statIcon: { fontSize: 20 },
  statCompactContent: { flex: 1 },
  statCompactValue: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  statCompactLabel: { fontSize: 11, color: "#64748b", marginTop: 2 },

  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 16 },

  // FILTROS
  filtroTitle: { fontSize: 14, fontWeight: "700", color: "#475569", marginBottom: 12 },
  filtrosRow: { gap: 10, marginBottom: 12 },
  filtroGroupSmall: { flex: 1 },
  filtroGroupDouble: { flex: 2, flexDirection: "row", gap: 8 },
  filtroLabel: { fontSize: 11, fontWeight: "600", color: "#64748b", marginBottom: 4 },
  filtroInputBtn: { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 8, justifyContent: "center" },
  filtroInputText: { fontSize: 12, color: "#1f2937", fontWeight: "500" },
  filterButtonsCompact: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  filterBtnSmall: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#cbd5e1" },
  filterBtnSmallActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  filterBtnText: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  filterBtnTextActive: { color: "#fff", fontWeight: "700" },

  filtroButtonsContainer: { flexDirection: "row", gap: 10, marginBottom: 12 },
  btnAplicar: { flex: 1, backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  btnAplicarText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  btnLimpiar: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 8, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1" },
  btnLimpiarText: { color: "#64748b", fontWeight: "700", fontSize: 12 },

  // TABLA
  tablaTitle: { fontSize: 14, fontWeight: "700", color: "#475569", marginBottom: 12 },
  loadingContainer: { alignItems: "center", paddingVertical: 30 },
  loadingText: { color: "#64748b", marginTop: 10, fontSize: 13 },
  emptyText: { color: "#64748b", fontSize: 14, textAlign: "center", paddingVertical: 30 },

  accesoItem: { backgroundColor: "#f8fafc", borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  accesoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  accesoUsuario: { fontSize: 13, fontWeight: "700", color: "#0f172a", flex: 1 },
  accesoOperacion: { fontSize: 12, fontWeight: "600", color: "#2563eb" },
  accesoTiempo: { fontSize: 11, color: "#94a3b8" },
  accesoDetalles: { fontSize: 12, color: "#64748b" },

  button: { backgroundColor: "#ef4444", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  errorTitle: { fontSize: 18, fontWeight: "700", color: "#ef4444", textAlign: "center", marginBottom: 10 },
  errorText: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 20 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingVertical: 20, paddingHorizontal: 20, maxHeight: "80%" },
  modalClose: { alignSelf: "flex-end", paddingBottom: 10 },
  modalCloseText: { fontSize: 24, color: "#64748b", fontWeight: "700" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  modalField: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  modalLabel: { fontSize: 11, fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: 4 },
  modalValue: { fontSize: 13, color: "#0f172a", fontWeight: "500" },
});


