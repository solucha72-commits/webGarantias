import { View, Text, StyleSheet, FlatList, Pressable, Platform, TextInput } from "react-native";
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
};

export default function Formulario() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [garantiasFiltradas, setGarantiasFiltradas] = useState<Garantia[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("garantias")
      .select("id,tipo,marca,modelo,importe,duracion_garantia,centro_compra,fechacompra")
      .order("id", { ascending: false })
      .then(({ data }) => setGarantias(data ?? []));
  }, []);

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
      <View style={styles.contentWrapper}>
        <Text style={styles.header}>Mis Garantías Guardadas</Text>

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
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
                onPress={() => router.push({ pathname: "/garantia", params: { id: item.id } })}
              >
                {/* HEADER: Tipo y Marca */}
                <View style={styles.headerSection}>
                  <Text style={styles.title}>
                    {item.tipo} · {item.marca}
                  </Text>
                </View>

                {/* CONTENIDO PRINCIPAL */}
                <View style={styles.contentSection}>
                  {/* FILA 1: Modelo */}
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Modelo</Text>
                    <Text style={styles.value}>{item.modelo}</Text>
                  </View>

                  {/* FILA 2: Centro y Fecha */}
                  <View style={styles.twoColumnRow}>
                    <View style={styles.halfColumn}>
                      <Text style={styles.label}>Centro</Text>
                      <Text style={styles.value}>{item.centro_compra}</Text>
                    </View>
                    <View style={styles.halfColumn}>
                      <Text style={styles.label}>Fecha Compra</Text>
                      <Text style={styles.value}>{formatearFecha(item.fechacompra)}</Text>
                    </View>
                  </View>
                </View>

                {/* PRECIO A LA DERECHA */}
                <View style={styles.priceSection}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{item.importe}€</Text>
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

  // ========== CAMPO DE BÚSQUEDA ==========
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
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
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
        cursor: "pointer",
      },
      default: { elevation: 3 },
    }),
  },

  // ========== SECTIONS ==========
  headerSection: {
    marginBottom: 12,
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
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
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 16,
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
    borderColor: "#3b82f6",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e40af",
    textAlign: "center",
  },

  tapText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
    fontWeight: "600",
  },

  // ========== BOTÓN VOLVER ==========
  backButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(59, 130, 246, 0.3)",
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
