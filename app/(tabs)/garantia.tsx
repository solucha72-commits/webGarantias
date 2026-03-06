import { View, Text, StyleSheet, Pressable, Platform, ScrollView, Modal, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatFecha } from "@/lib/utils/date";

export default function GarantiaDetalle() {
  const { id } = useLocalSearchParams();
  const [g, setG] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGarantia();
  }, [id]);

  const fetchGarantia = async () => {
    const { data } = await supabase.from("garantias").select("*").eq("id", id).single();

    if (data) {
      setG(data);
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
        </View>

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

        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Volver al listado</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: { flex: 1, backgroundColor: "#f4f6f8" },
  scrollContent: { alignItems: "center", paddingVertical: 40 },
  contentWrapper: { width: "100%", maxWidth: 850, paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, fontWeight: "800", marginBottom: 20 },
  infoCard: { backgroundColor: "#fff", borderRadius: 12, padding: 25, elevation: 3 },
  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1 },
  label: { fontSize: 11, color: "#6b7280", fontWeight: "600" },
  topValue: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
  viewBtn: { backgroundColor: "#f0fdf4", padding: 6, borderRadius: 6, marginTop: 5, alignSelf: "flex-start", borderWidth: 1, borderColor: "#bbf7d0" },
  viewBtnText: { color: "#16a34a", fontSize: 12, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", height: "85%", backgroundColor: "#fff", borderRadius: 15, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  closeX: { fontSize: 20, fontWeight: "bold" },
  viewer: { flex: 1, backgroundColor: "#525659", borderRadius: 8, overflow: "hidden" },
  closeFullBtn: { backgroundColor: "#1f2937", padding: 12, borderRadius: 10, marginTop: 15, alignItems: "center" },
  closeFullBtnText: { color: "#fff", fontWeight: "700" },
  backLink: { marginTop: 25 },
  backLinkText: { color: "#6b7280" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
