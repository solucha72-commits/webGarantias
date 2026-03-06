import { View, Text, StyleSheet, FlatList, Pressable, Platform, ScrollView, Modal, TextInput, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

type Garantia = {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  importe: string;
  duracion_garantia: string;
  centro_compra: string;
  fechacompra: string;
  observaciones?: string;
};

export default function Informes() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroCentro, setFiltroCentro] = useState("");
  const [garantiasFiltradas, setGarantiasFiltradas] = useState<Garantia[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [centros, setCentros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarGarantias();
  }, []);

  // ========== CARGAR GARANTÍAS ==========
  const cargarGarantias = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("garantias")
        .select("*")
        .order("id", { ascending: false });

      if (data) {
        setGarantias(data);
        // Extraer valores únicos para filtros
        const tiposUnicos = [...new Set(data.map((g) => g.tipo))];
        const marcasUnicas = [...new Set(data.map((g) => g.marca))];
        const centrosUnicos = [...new Set(data.map((g) => g.centro_compra))];
        setTipos(tiposUnicos);
        setMarcas(marcasUnicas);
        setCentros(centrosUnicos);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== APLICAR FILTROS ==========
  useEffect(() => {
    let resultado = garantias;

    if (filtroTipo) {
      resultado = resultado.filter((g) => g.tipo === filtroTipo);
    }
    if (filtroMarca) {
      resultado = resultado.filter((g) => g.marca === filtroMarca);
    }
    if (filtroCentro) {
      resultado = resultado.filter((g) => g.centro_compra === filtroCentro);
    }

    setGarantiasFiltradas(resultado);
  }, [filtroTipo, filtroMarca, filtroCentro, garantias]);

  // ========== GENERAR CSV ==========
  const generarCSV = () => {
    if (garantiasFiltradas.length === 0) {
      alert("⚠️ No hay registros para generar el informe");
      return;
    }

    // Headers
    const headers = [
      "ID",
      "Familia",
      "Marca",
      "Modelo",
      "Importe (€)",
      "Duración (años)",
      "Centro Compra",
      "Fecha Compra",
      "Observaciones",
    ];

    // Filas
    const filas = garantiasFiltradas.map((g) => [
      g.id,
      g.tipo,
      g.marca,
      g.modelo,
      g.importe,
      g.duracion_garantia,
      g.centro_compra,
      g.fechacompra,
      g.observaciones || "",
    ]);

    // Crear CSV
    let csv = headers.join(",") + "\n";
    filas.forEach((fila) => {
      csv += fila.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    return csv;
  };

  // ========== DESCARGAR CSV ==========
  const descargarCSV = () => {
    const csv = generarCSV();
    if (!csv) return;

    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `informe-garantias-${new Date().getTime()}.csv`;
      link.click();
      alert("✅ CSV descargado correctamente");
    } else {
      alert("💾 CSV generado. Copiar al portapapeles:\n\n" + csv.substring(0, 100) + "...");
    }
  };

  // ========== COPIAR AL PORTAPAPELES ==========
  const copiarAlPortapapeles = async (texto: string) => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(texto);
        return true;
      }
    } catch (error) {
      console.error("Error al copiar:", error);
      return false;
    }
    return false;
  };

  // ========== ENVIAR POR EMAIL ==========
  const enviarPorEmail = async () => {
    if (!email.trim()) {
      alert("⚠️ Ingresa un correo electrónico");
      return;
    }

    const csv = generarCSV();
    if (!csv) return;

    setEnviando(true);
    try {
      // Crear el contenido del email
      const asunto = "Informe de Garantías";
      const cuerpo = `
Informe de Garantías - ${new Date().toLocaleDateString("es-ES")}

FILTROS APLICADOS:
- Familia: ${filtroTipo || "Todas"}
- Marca: ${filtroMarca || "Todas"}
- Centro: ${filtroCentro || "Todos"}

========================================
DATOS DEL INFORME (CSV):
========================================

${csv}

========================================
Este informe fue generado automáticamente.
      `;

      // Copiar al portapapeles
      const copiado = await copiarAlPortapapeles(cuerpo);

      if (copiado) {
        alert(`✅ Informe copiado al portapapeles!\n\n📋 Ahora:\n1. Abre tu email\n2. Pega el contenido (Ctrl+V)\n3. Envía a: ${email}`);
      } else {
        // Fallback: Mostrar el contenido
        alert(`📧 Contenido del informe:\n\n${cuerpo.substring(0, 200)}...\n\nCópialo y envíalo a: ${email}`);
      }

      setModalEmail(false);
      setEmail("");
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentWrapper}>
        <Text style={styles.header}>📊 Informes de Garantías</Text>

        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          {/* Familia */}
          <View style={styles.filtroItem}>
            <Text style={styles.filtroLabel}>FAMILIA</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={filtroTipo}
                onValueChange={(itemValue) => setFiltroTipo(itemValue)}
                style={{ height: 60, fontSize: 16 }}
              >
                <Picker.Item label="Todas" value="" />
                {tipos.map((tipo) => (
                  <Picker.Item key={tipo} label={tipo} value={tipo} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Marca */}
          <View style={styles.filtroItem}>
            <Text style={styles.filtroLabel}>MARCA</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={filtroMarca}
                onValueChange={(itemValue) => setFiltroMarca(itemValue)}
                style={{ height: 60, fontSize: 16 }}
              >
                <Picker.Item label="Todas" value="" />
                {marcas.map((marca) => (
                  <Picker.Item key={marca} label={marca} value={marca} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Centro */}
          <View style={styles.filtroItem}>
            <Text style={styles.filtroLabel}>CENTRO</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={filtroCentro}
                onValueChange={(itemValue) => setFiltroCentro(itemValue)}
                style={{ height: 60, fontSize: 16 }}
              >
                <Picker.Item label="Todos" value="" />
                {centros.map((centro) => (
                  <Picker.Item key={centro} label={centro} value={centro} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>📈 Resumen del Informe</Text>
          <View style={styles.resumenRow}>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Total Registros</Text>
              <Text style={styles.resumenValor}>{garantiasFiltradas.length}</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Importe Total</Text>
              <Text style={styles.resumenValor}>
                €{garantiasFiltradas.reduce((sum, g) => sum + parseFloat(g.importe || "0"), 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Familias</Text>
              <Text style={styles.resumenValor}>
                {new Set(garantiasFiltradas.map((g) => g.tipo)).size}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabla de Registros */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : garantiasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No hay registros para estos filtros</Text>
          </View>
        ) : (
          <FlatList
            data={garantiasFiltradas}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.registroCard}>
                <View style={styles.registroHeader}>
                  <Text style={styles.registroTitulo}>
                    {item.tipo} · {item.marca}
                  </Text>
                </View>
                <View style={styles.registroRow}>
                  <Text style={styles.registroLabel}>Modelo:</Text>
                  <Text style={styles.registroValue}>{item.modelo}</Text>
                </View>
                <View style={styles.registroRow}>
                  <Text style={styles.registroLabel}>Importe:</Text>
                  <Text style={styles.registroValue}>{item.importe}€</Text>
                </View>
                <View style={styles.registroRow}>
                  <Text style={styles.registroLabel}>Centro:</Text>
                  <Text style={styles.registroValue}>{item.centro_compra}</Text>
                </View>
                <View style={styles.registroRow}>
                  <Text style={styles.registroLabel}>Fecha:</Text>
                  <Text style={styles.registroValue}>{item.fechacompra}</Text>
                </View>
              </View>
            )}
          />
        )}

        {/* Botones de Acción */}
        <View style={styles.buttonGroup}>
          <Pressable
            style={styles.btnCSV}
            onPress={descargarCSV}
            disabled={garantiasFiltradas.length === 0}
          >
            <Text style={styles.btnCSVText}>📥 Descargar CSV</Text>
          </Pressable>

          <Pressable
            style={styles.btnEmail}
            onPress={() => setModalEmail(true)}
            disabled={garantiasFiltradas.length === 0}
          >
            <Text style={styles.btnEmailText}>📧 Enviar por Email</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Volver al Menú Principal</Text>
        </Pressable>
      </View>

      {/* Modal Email */}
      <Modal visible={modalEmail} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📧 Enviar Informe por Email</Text>

            <TextInput
              style={styles.emailInput}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalBtnCancel}
                onPress={() => setModalEmail(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtnSend, enviando && { opacity: 0.6 }]}
                onPress={enviarPorEmail}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnSendText}>📧 Enviar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
  },

  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 1000,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    fontSize: 32,
    fontWeight: "900",
    color: "#102a43",
    marginBottom: 24,
    textAlign: "center",
  },

  // ========== FILTROS ==========
  filtrosContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    justifyContent: "space-around",
  },

  filtroItem: {
    flex: 1,
  },

  filtroLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  pickerBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    overflow: "hidden",
  },

  // ========== RESUMEN ==========
  resumenCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  resumenTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102a43",
    marginBottom: 16,
  },

  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  resumenItem: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  resumenLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },

  resumenValor: {
    fontSize: 20,
    fontWeight: "900",
    color: "#3b82f6",
  },

  // ========== TABLA ==========
  listPadding: {
    paddingBottom: 20,
  },

  registroCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    elevation: 2,
  },

  registroHeader: {
    marginBottom: 12,
  },

  registroTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2937",
  },

  registroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  registroLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },

  registroValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  // ========== ESTADO VACÍO ==========
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6b7280",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ========== BOTONES ==========
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  btnCSV: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnCSVText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  btnEmail: {
    flex: 1,
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnEmailText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  backButton: {
    paddingVertical: 14,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  backText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  // ========== MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102a43",
    marginBottom: 16,
  },

  emailInput: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
    color: "#1f2937",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },

  modalBtnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  modalBtnCancelText: {
    color: "#6b7280",
    fontWeight: "700",
  },

  modalBtnSend: {
    flex: 1,
    backgroundColor: "#f59e0b",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  modalBtnSendText: {
    color: "#fff",
    fontWeight: "800",
  },
});
