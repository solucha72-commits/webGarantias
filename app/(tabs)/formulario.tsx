import { View, Text, StyleSheet, FlatList, Pressable, Platform, TextInput, ScrollView, useWindowDimensions } from "react-native";
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
};

export default function Formulario() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [garantiasFiltradas, setGarantiasFiltradas] = useState<Garantia[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();
  
  const windowDimensions = useWindowDimensions();
  const isMobile = windowDimensions.width < 768;

  // ========== FUNCIÓN PARA CARGAR GARANTÍAS ==========
  const cargarGarantias = useCallback(async () => {
    const { data } = await supabase
      .from("garantias")
      .select("id,tipo,marca,modelo,importe,duracion_garantia,centro_compra,fechacompra")
      .order("id", { ascending: false });
    
    setGarantias(data ?? []);
  }, []);

  // ========== RECARGAR CUANDO LA PANTALLA RECIBE FOCO ==========
  useFocusEffect(
    useCallback(() => {
      cargarGarantias();
    }, [cargarGarantias])
  );

  // ========== CARGAR INICIAL ==========
  useEffect(() => {
    cargarGarantias();
  }, [cargarGarantias]);

  // ========== FILTRAR POR BÚSQUEDA ==========
  useEffect(() => {
    if (!busqueda.trim()) {
      setGarantiasFiltradas(garantias);
    } else {
      const filtro = busqueda.toLowerCase();
      const resultado = garantias.filter(
        (g) =>
          g.tipo.toLowerCase().includes(filtro) ||
          g.marca.toLowerCase().includes(filtro) ||
          g.centro_compra.toLowerCase().includes(filtro)
      );
      setGarantiasFiltradas(resultado);
    }
  }, [busqueda, garantias]);

  // Función para formatear la fecha
  const formatearFecha = (fecha: string) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getRowStyle = () => isMobile ? styles.rowMobile : styles.rowDesktop;
  const getLayoutStyle = () => isMobile ? styles.layoutMobile : styles.layoutDesktop;

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.cardContainer, isMobile && styles.cardMobile]}>
          <View style={styles.contentWrapper}>
            <Text style={[styles.header, isMobile && styles.headerMobile]}>Mis Garantías Guardadas</Text>

            {/* ========== CAMPO DE BÚSQUEDA ========== */}
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar por familia, marca o centro..."
              placeholderTextColor="#9ca3af"
              value={busqueda}
              onChangeText={setBusqueda}
            />

            {garantiasFiltradas.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>{busqueda ? "🔍" : "📋"}</Text>
                <Text style={styles.emptyText}>
                  {busqueda ? "No se encontraron garantías" : "No hay garantías registradas"}
                </Text>
                {!busqueda && (
                  <Pressable onPress={() => router.push("/altas")} style={styles.emptyButton}>
                    <Text style={styles.emptyButtonText}>+ Nueva Garantía</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <FlatList
                data={garantiasFiltradas}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listPadding}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [isMobile ? styles.rowMobile : styles.rowDesktop, pressed && { opacity: 0.85 }]}
                    onPress={() => router.push({ pathname: "/garantia", params: { id: item.id } })}
                  >
                    {isMobile ? (
                      // LAYOUT MOBILE - COLUMNAS ORDENADAS
                      <>
                        <View style={styles.headerSection}>
                          <Text style={styles.title}>{item.tipo} · {item.marca}</Text>
                        </View>
                        <View style={styles.contentSection}>
                          {/* Fila 1: Modelo y Centro lado a lado */}
                          <View style={styles.rowLayout}>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Modelo</Text>
                              <Text style={styles.value}>{item.modelo}</Text>
                            </View>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Centro</Text>
                              <Text style={styles.value}>{item.centro_compra}</Text>
                            </View>
                          </View>
                          
                          {/* Fila 2: Fecha Compra y Precio lado a lado */}
                          <View style={styles.rowLayout}>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Fecha Compra</Text>
                              <Text style={styles.value}>{formatearFecha(item.fechacompra)}</Text>
                            </View>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Precio</Text>
                              <Text style={[styles.value, styles.priceBold]}>{item.importe}€</Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.priceSectionMobile}>
                          <Text style={styles.tapText}>Ver detalles →</Text>
                        </View>
                      </>
                    ) : (
                      // LAYOUT DESKTOP - MISMO ORDEN QUE MOBILE PERO HORIZONTAL
                      <>
                        <View style={styles.headerSectionDesktop}>
                          <Text style={styles.title}>{item.tipo} · {item.marca}</Text>
                        </View>
                        <View style={styles.contentSectionDesktop}>
                          {/* Fila 1: Modelo y Centro lado a lado */}
                          <View style={styles.rowLayout}>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Modelo</Text>
                              <Text style={styles.value}>{item.modelo}</Text>
                            </View>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Centro</Text>
                              <Text style={styles.value}>{item.centro_compra}</Text>
                            </View>
                          </View>
                          
                          {/* Fila 2: Fecha Compra y Precio lado a lado */}
                          <View style={styles.rowLayout}>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Fecha Compra</Text>
                              <Text style={styles.value}>{formatearFecha(item.fechacompra)}</Text>
                            </View>
                            <View style={styles.halfColumn}>
                              <Text style={styles.label}>Precio</Text>
                              <Text style={[styles.value, styles.priceBold]}>{item.importe}€</Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.priceSectionMobile}>
                          <Text style={styles.tapText}>Ver detalles →</Text>
                        </View>
                      </>
                    )}
                  </Pressable>
                )}
              />
            )}

            <Pressable onPress={() => router.push("/")} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}>
              <Text style={styles.backText}>← Volver al Menú Principal</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    paddingVertical: 20,
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 10,
    minHeight: "100%",
  },

  cardContainer: {
    width: "100%",
    maxWidth: 1000,
    backgroundColor: "#ffffff",
    borderRadius: 32,
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

  cardMobile: {
    borderRadius: 16,
  },

  contentWrapper: {
    width: "100%",
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

  headerMobile: {
    fontSize: 24,
    marginBottom: 16,
  },

  searchInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
    color: "#1f2937",
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
    color: "#6b7280",
    marginBottom: 30,
  },

  emptyButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  listPadding: {
    paddingBottom: 40,
  },

  // ========== LAYOUTS ==========
  rowDesktop: {
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
        cursor: "pointer",
      },
      default: { elevation: 2 },
    }),
  },

  rowMobile: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    elevation: 2,
  },

  layoutDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },

  layoutMobile: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 12,
  },

  // ========== SECTIONS ==========
  headerSection: {
    width: "100%",
  },

  headerSectionDesktop: {
    width: 150,
    minWidth: 150,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  contentSection: {
    gap: 12,
    width: "100%",
  },

  contentSectionDesktop: {
    flex: 1,
    gap: 12,
  },

  infoRow: {
    gap: 4,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  rowLayout: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },

  columnLayout: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },

  halfColumn: {
    flex: 1,
    gap: 4,
  },

  priceSection: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    minWidth: 100,
    width: "100%",
  },

  priceSectionMobile: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  priceBold: {
    fontWeight: "900",
    color: "#1e40af",
    fontSize: 16,
  },

  priceContainer: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2563eb",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e40af",
    textAlign: "center",
  },

  tapText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
    fontWeight: "600",
  },

  // ========== BOTÓN VOLVER ==========
  backButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 18,
    marginTop: 30,
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});
