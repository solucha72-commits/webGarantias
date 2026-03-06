import { View, Text, StyleSheet, Pressable, Platform, ScrollView, Modal, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatFecha } from "@/lib/utils/date";

export default function GarantiaDetalle() {
  const { id } = useLocalSearchParams();
  const [g, setG] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fechaVencimiento, setFechaVencimiento] = useState<string | null>(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formEditar, setFormEditar] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGarantia();
  }, [id]);

  const fetchGarantia = async () => {
    const { data } = await supabase.from("garantias").select("*").eq("id", id).single();

    if (data) {
      setG(data);

      // Calcular fecha de vencimiento
      if (data.fechacompra && data.duracion_garantia) {
        const fechaCompra = new Date(data.fechacompra);
        const duracion = parseInt(data.duracion_garantia) || 0;
        const fechaVencimientoCalc = new Date(fechaCompra);
        fechaVencimientoCalc.setFullYear(fechaVencimientoCalc.getFullYear() + duracion);
        
        const fechaFormato = fechaVencimientoCalc.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        setFechaVencimiento(fechaFormato);
      }

      if (data.nombre_archivo) {
        const nombreLimpio = data.nombre_archivo.trim();

        // --- PRUEBA 1: Buscar en la raíz ---
        const { data: urlRaiz } = supabase.storage.from("garantias").getPublicUrl(nombreLimpio);

        // --- PRUEBA 2: Buscar en carpeta pdf ---
        const { data: urlPdf } = supabase.storage.from("garantias").getPublicUrl(`pdf/${nombreLimpio}`);

        console.log("¿Está en la raíz?:", urlRaiz.publicUrl);
        console.log("¿Está en carpeta PDF?:", urlPdf.publicUrl);

        // Por ahora, vamos a probar con la de la carpeta PDF ya que tu URL anterior la tenía
        setFileUrl(urlPdf.publicUrl);
      }
    }
  };

  if (!g)
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );

  // ========== ABRIR MODAL EDITAR ==========
  const handleAbrirEditar = () => {
    setFormEditar({ ...g });
    setModalEditar(true);
  };

  // ========== ELIMINAR GARANTÍA ==========
  const handleEliminarGarantia = async () => {
    Alert.alert(
      "⚠️ ¿Estás seguro?",
      "Esta acción eliminará la garantía permanentemente",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              setEditando(true);
              const { error } = await supabase
                .from("garantias")
                .delete()
                .eq("id", id);

              if (error) throw error;

              alert("✅ Garantía eliminada correctamente");
              router.push("/formulario");
            } catch (error: any) {
              alert("❌ Error al eliminar: " + error.message);
            } finally {
              setEditando(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // ========== GUARDAR CAMBIOS EN BD ==========
  const handleGuardarCambios = async () => {
    if (!formEditar) return;

    setEditando(true);
    try {
      const { error } = await supabase
        .from("garantias")
        .update({
          tipo: formEditar.tipo,
          marca: formEditar.marca,
          modelo: formEditar.modelo,
          importe: formEditar.importe,
          duracion_garantia: formEditar.duracion_garantia,
          centro_compra: formEditar.centro_compra,
          observaciones: formEditar.observaciones,
        })
        .eq("id", id);

      if (error) throw error;

      setG(formEditar);
      setModalEditar(false);
      alert("✅ Garantía actualizada correctamente");
    } catch (error: any) {
      alert("❌ Error al actualizar: " + error.message);
    } finally {
      setEditando(false);
    }
  };

  const isPDF = g.nombre_archivo?.toLowerCase().endsWith(".pdf");

  return (
    <ScrollView style={styles.mainBackground} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentWrapper}>
        <Text style={styles.headerTitle}>Ficha de Garantía</Text>

        <View style={styles.infoCard}>
          {/* Fila 1 */}
          <View style={styles.gridRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Familia</Text>
              <Text style={styles.topValue}>{g.tipo || "-"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Marca</Text>
              <Text style={styles.topValue}>{g.marca || "-"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Modelo</Text>
              <Text style={styles.topValue}>{g.modelo || "-"}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Fila 2 */}
          <View style={styles.gridRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Importe</Text>
              <Text style={[styles.topValue, { color: "#2563eb" }]}>{g.importe} €</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha Compra</Text>
              <Text style={styles.topValue}>{formatFecha(g.fechacompra)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Documento</Text>
              {g.nombre_archivo ? (
                <Pressable onPress={() => setModalVisible(true)} style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>👁️ Ver {isPDF ? "PDF" : "Imagen"}</Text>
                </Pressable>
              ) : (
                <Text style={styles.topValue}>No adjunto</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Fila 3: Duración y Vencimiento */}
          <View style={styles.gridRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Duración Garantía</Text>
              <Text style={styles.topValue}>{g.duracion_garantia ? `${g.duracion_garantia} años` : "-"}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha Vencimiento</Text>
              <Text style={[styles.topValue, { color: fechaVencimiento ? "#dc2626" : "#6b7280" }]}>
                {fechaVencimiento || "-"}
              </Text>
            </View>
            <View style={styles.column} />
          </View>
        </View>

        {/* ========== BOTONES EDITAR Y ELIMINAR ========== */}
        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleAbrirEditar} style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.editButtonText}>✏️ Editar</Text>
          </Pressable>

          <Pressable onPress={handleEliminarGarantia} style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
          </Pressable>
        </View>

        {/* ========== MODAL EDITAR GARANTÍA ========== */}
        <Modal visible={modalEditar} transparent={true} animationType="slide">
          <View style={styles.modalEditOverlay}>
            <View style={styles.modalEditContent}>
              <View style={styles.modalEditHeader}>
                <Text style={styles.modalEditTitle}>Editar Garantía</Text>
                <Pressable onPress={() => setModalEditar(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.editForm}>
                {/* Tipo/Familia */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Familia</Text>
                  <View style={styles.formInput}>
                    <Text style={styles.formValue}>{formEditar?.tipo || "-"}</Text>
                  </View>
                </View>

                {/* Marca */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Marca</Text>
                  <View style={styles.formInput}>
                    <Text style={styles.formValue}>{formEditar?.marca || "-"}</Text>
                  </View>
                </View>

                {/* Modelo */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Modelo</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formEditar?.modelo || ""}
                    onChangeText={(text) => setFormEditar({ ...formEditar, modelo: text })}
                    placeholder="Modelo"
                  />
                </View>

                {/* Importe */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Importe (€)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formEditar?.importe || ""}
                    onChangeText={(text) => setFormEditar({ ...formEditar, importe: text })}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>

                {/* Duración */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Duración Garantía (años)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formEditar?.duracion_garantia || ""}
                    onChangeText={(text) => setFormEditar({ ...formEditar, duracion_garantia: text })}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                </View>

                {/* Centro */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Centro Compra</Text>
                  <View style={styles.formInput}>
                    <Text style={styles.formValue}>{formEditar?.centro_compra || "-"}</Text>
                  </View>
                </View>

                {/* Observaciones */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Observaciones</Text>
                  <TextInput
                    style={[styles.textInput, { height: 80, textAlignVertical: "top" }]}
                    value={formEditar?.observaciones || ""}
                    onChangeText={(text) => setFormEditar({ ...formEditar, observaciones: text })}
                    placeholder="Notas..."
                    multiline
                  />
                </View>
              </ScrollView>

              <View style={styles.modalEditButtons}>
                <Pressable
                  style={styles.btnCancelar}
                  onPress={() => setModalEditar(false)}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={[styles.btnGuardar, editando && { opacity: 0.6 }]}
                  onPress={handleGuardarCambios}
                  disabled={editando}
                >
                  {editando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnGuardarText}>💾 Guardar Cambios</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Visor Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{g.nombre_archivo}</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.viewer}>
                {fileUrl ? (
                  isPDF && Platform.OS === "web" ? (
                    <iframe src={fileUrl} style={{ width: "100%", height: "100%", border: "none" }} />
                  ) : (
                    <Image source={{ uri: fileUrl }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                  )
                ) : (
                  <Text>Cargando...</Text>
                )}
              </View>

              <Pressable style={styles.closeFullBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeFullBtnText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ========== BOTÓN VOLVER CENTRADO ========== */}
        <Pressable onPress={() => router.push("/formulario")} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}>
          <Text style={styles.backButtonText}>← Volver a Mis Garantías</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: { flex: 1, backgroundColor: "#f0f4f8" },
  scrollContent: { alignItems: "center", paddingVertical: 40 },
  contentWrapper: { width: "100%", maxWidth: 850, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: "800", marginBottom: 24, color: "#102a43", textAlign: "center" },
  infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 28, elevation: 3, marginBottom: 40 },
  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1 },
  label: { fontSize: 11, color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  topValue: { fontSize: 16, fontWeight: "700", marginTop: 8, color: "#1f2937" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 24 },
  viewBtn: { backgroundColor: "#f0fdf4", padding: 8, borderRadius: 8, marginTop: 8, alignSelf: "flex-start", borderWidth: 1.5, borderColor: "#10b981" },
  viewBtnText: { color: "#16a34a", fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", height: "85%", backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, alignItems: "center" },
  modalTitle: { fontSize: 15, fontWeight: "800", flex: 1, color: "#1f2937" },
  closeX: { fontSize: 24, fontWeight: "bold", color: "#6b7280" },
  viewer: { flex: 1, backgroundColor: "#374151", borderRadius: 10, overflow: "hidden" },
  closeFullBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, marginTop: 16, alignItems: "center", elevation: 2 },
  closeFullBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ========== BOTÓN VOLVER CENTRADO ==========
  backButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(59, 130, 246, 0.3)",
        cursor: "pointer",
      },
    }),
  },

  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  // ========== BOTONES EDITAR Y ELIMINAR ==========
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(245, 158, 11, 0.3)",
        cursor: "pointer",
      },
    }),
  },

  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(239, 68, 68, 0.3)",
        cursor: "pointer",
      },
    }),
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  // ========== MODAL EDITAR ==========
  modalEditOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalEditContent: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    maxHeight: "85%",
  },

  modalEditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  modalEditTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102a43",
  },

  editForm: {
    paddingBottom: 16,
    maxHeight: "70%",
  },

  formGroup: {
    marginBottom: 18,
  },

  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 6,
  },

  formInput: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  formValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1f2937",
  },

  modalEditButtons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  btnCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnCancelarText: {
    color: "#6b7280",
    fontWeight: "700",
    fontSize: 14,
  },

  btnGuardar: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },

  btnGuardarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});
