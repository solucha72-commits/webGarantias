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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
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
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  isMobile ? styles.rowMobile : styles.row,
                  pressed && { opacity: 0.85 }
                ]}
                onPress={() => router.push({ pathname: "/garantia", params: { id: item.id } })}
              >
                {/* HEADER: Tipo y Marca */}
                <View style={styles.headerSection}>
                  <Text style={[styles.title, isMobile && styles.titleMobile]}>
                    {item.tipo} · {item.marca}
                  </Text>
                </View>

                {/* CONTENIDO PRINCIPAL */}
                <View style={styles.contentSection}>
                  {/* FILA 1: Modelo */}
                  <View style={styles.infoRow}>
                    <Text style={[styles.label, isMobile && styles.labelMobile]}>Modelo</Text>
                    <Text style={[styles.value, isMobile && styles.valueMobile]}>{item.modelo}</Text>
                  </View>

                  {/* FILA 2: Centro y Fecha */}
                  <View style={isMobile ? styles.twoColumnRowMobile : styles.twoColumnRow}>
                    <View style={styles.halfColumn}>
                      <Text style={[styles.label, isMobile && styles.labelMobile]}>Centro</Text>
                      <Text style={[styles.value, isMobile && styles.valueMobile]}>{item.centro_compra}</Text>
                    </View>
                    <View style={styles.halfColumn}>
                      <Text style={[styles.label, isMobile && styles.labelMobile]}>Fecha Compra</Text>
                      <Text style={[styles.value, isMobile && styles.valueMobile]}>{formatearFecha(item.fechacompra)}</Text>
                    </View>
                  </View>
                </View>

                {/* PRECIO A LA DERECHA */}
                <View style={styles.priceSection}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, isMobile && styles.priceMobile]}>{item.importe}€</Text>
                  </View>
                  <Text style={styles.tapText}>Ver detalles →</Text>
                </View>
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
  },

  cardContainer: {
    width: "100%",
    maxWidth: 1000,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 0,
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
    flex: 1,
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
  },

  // ========== CAMPO DE BÚSQUEDA ==========
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

  // ========== LISTA ==========
  listPadding: {
    paddingBottom: 40,
  },

  row: {
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
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
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 12,
    elevation: 2,
  },

  // ========== SECTIONS ==========
  headerSection: {
    marginBottom: 12,
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  titleMobile: {
    fontSize: 14,
  },

  contentSection: {
    flex: 1.5,
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

  labelMobile: {
    fontSize: 10,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  valueMobile: {
    fontSize: 13,
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },

  twoColumnRowMobile: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },

  halfColumn: {
    flex: 1,
    gap: 4,
  },

  priceSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 100,
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

  priceMobile: {
    fontSize: 14,
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
