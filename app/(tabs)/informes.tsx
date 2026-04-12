import { View, Text, StyleSheet, FlatList, Pressable, Platform, ScrollView, Modal, TextInput, ActivityIndicator, Switch } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";

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
  const [mostrarCaducadas, setMostrarCaducadas] = useState<boolean | null>(null);
  const [garantiasFiltradas, setGarantiasFiltradas] = useState<Garantia[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [centros, setCentros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ========== FUNCIÓN: Verificar si una garantía está caducada ==========
  const estaCaducada = (fechaCompra: string, duracionAnios: string): boolean => {
    if (!fechaCompra || !duracionAnios) return false;
    
    const fecha = new Date(fechaCompra);
    const duracion = parseInt(duracionAnios) || 0;
    const fechaVencimiento = new Date(fecha);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + duracion);
    
    return new Date() > fechaVencimiento;
  };

  // ========== CARGAR GARANTÍAS ==========
  const cargarGarantias = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("garantias")
        .select("*")
        .order("id", { ascending: false });

      if (data) {
        setGarantias(data);
        const tiposUnicos = [...new Set(data.map((g) => g.tipo))].sort();
        const marcasUnicas = [...new Set(data.map((g) => g.marca))].sort();
        const centrosUnicos = [...new Set(data.map((g) => g.centro_compra))].sort();
        setTipos(tiposUnicos);
        setMarcas(marcasUnicas);
        setCentros(centrosUnicos);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarGarantias();
    }, [cargarGarantias])
  );

  useEffect(() => {
    cargarGarantias();
  }, [cargarGarantias]);

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

    if (mostrarCaducadas !== null) {
      resultado = resultado.filter((g) => {
        const caducada = estaCaducada(g.fechacompra, g.duracion_garantia);
        return mostrarCaducadas ? caducada : !caducada;
      });
    }

    // Ordenar alfabéticamente por TIPO
    resultado = resultado.sort((a, b) => a.tipo.localeCompare(b.tipo));

    setGarantiasFiltradas(resultado);
  }, [filtroTipo, filtroMarca, filtroCentro, mostrarCaducadas, garantias]);

  // ========== GENERAR CSV ==========
  const generarCSV = () => {
    if (garantiasFiltradas.length === 0) {
      alert("⚠️ No hay registros para generar el informe");
      return;
    }

    const headers = [
      "ID",
      "Familia",
      "Marca",
      "Modelo",
      "Importe (€)",
      "Duración (años)",
      "Centro Compra",
      "Fecha Compra",
      "Estado",
      "Observaciones",
    ];

    const filas = garantiasFiltradas.map((g) => [
      g.id,
      g.tipo,
      g.marca,
      g.modelo,
      g.importe,
      g.duracion_garantia,
      g.centro_compra,
      g.fechacompra,
      estaCaducada(g.fechacompra, g.duracion_garantia) ? "Caducada" : "Vigente",
      g.observaciones || "",
    ]);

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

  return (
    <ScrollView style={styles.mainContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.header}>📊 Informes de Garantías</Text>

          {/* ========== FILTROS PRINCIPALES ========== */}
          <View style={styles.filtrosContainer}>
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

          {/* ========== FILTRO DE ESTADO (Caducadas/Vigentes) ========== */}
          <View style={styles.filtroEstadoContainer}>
            <Text style={styles.estadoTitle}>ESTADO DE GARANTÍA</Text>
            <View style={styles.switchesRow}>
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>📅 Todas</Text>
                <Switch
                  value={mostrarCaducadas === null}
                  onValueChange={() => setMostrarCaducadas(null)}
                  trackColor={{ false: "#cbd5e1", true: "#10b981" }}
                  thumbColor={mostrarCaducadas === null ? "#fff" : "#ccc"}
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>✅ Vigentes</Text>
                <Switch
                  value={mostrarCaducadas === false}
                  onValueChange={() => setMostrarCaducadas(false)}
                  trackColor={{ false: "#cbd5e1", true: "#10b981" }}
                  thumbColor={mostrarCaducadas === false ? "#fff" : "#ccc"}
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>❌ Caducadas</Text>
                <Switch
                  value={mostrarCaducadas === true}
                  onValueChange={() => setMostrarCaducadas(true)}
                  trackColor={{ false: "#cbd5e1", true: "#ef4444" }}
                  thumbColor={mostrarCaducadas === true ? "#fff" : "#ccc"}
                />
              </View>
            </View>
          </View>

          {/* ========== RESUMEN ========== */}
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

          {/* ========== TABLA DE REGISTROS ========== */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : garantiasFiltradas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No hay registros para estos filtros</Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={garantiasFiltradas}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listPadding}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => {
                const caducada = estaCaducada(item.fechacompra, item.duracion_garantia);
                return (
                  <View style={[styles.registroCard, caducada && styles.registroCardCaducada]}>
                    <View style={styles.registroHeader}>
                      <Text style={styles.registroTitulo}>
                        {item.tipo} · {item.marca}
                      </Text>
                      <Text style={[styles.estadoTag, caducada ? styles.estadoTagCaducada : styles.estadoTagVigente]}>
                        {caducada ? "❌ Caducada" : "✅ Vigente"}
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
                );
              }}
            />
          )}

          {/* ========== BOTONES DE ACCIÓN ========== */}
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.btnCSV, garantiasFiltradas.length === 0 && styles.btnDisabled]}
              onPress={descargarCSV}
              disabled={garantiasFiltradas.length === 0}
            >
              <Text style={styles.btnCSVText}>📥 Descargar CSV</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push("/")}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.backText}>← Volver al Menú Principal</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
  },

  cardContainer: {
    width: "100%",
    maxWidth: 1000,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    marginHorizontal: 20,
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

  contentWrapper: {
    paddingHorizontal: 45,
    paddingVertical: 40,
  },

  header: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: -1,
  },

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
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  pickerBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    overflow: "hidden",
  },

  filtroEstadoContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  estadoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 12,
  },

  switchesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },

  switchGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  switchLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },

  resumenCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  resumenTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },

  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  resumenItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  resumenLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 4,
  },

  resumenValor: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2563eb",
  },

  listPadding: {
    paddingBottom: 20,
  },

  registroCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  registroCardCaducada: {
    borderLeftColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },

  registroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  registroTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    flex: 1,
  },

  estadoTag: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  estadoTagVigente: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },

  estadoTagCaducada: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },

  registroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  registroLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },

  registroValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  emptyState: {
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
    color: "#64748b",
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  btnCSV: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(16, 185, 129, 0.3)",
        cursor: "pointer",
      },
    }),
  },

  btnDisabled: {
    opacity: 0.5,
  },

  btnCSVText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  backButton: {
    paddingVertical: 14,
    backgroundColor: "#2563eb",
    borderRadius: 18,
    alignItems: "center",
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(37, 99, 235, 0.3)",
        cursor: "pointer",
      },
    }),
  },

  backText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
