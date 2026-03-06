import { View, Text, StyleSheet, FlatList, Pressable, Platform } from "react-native";
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
};

export default function Formulario() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("garantias")
      .select("id,tipo,marca,modelo,importe,duracion_garantia,centro_compra,nombre_archivo")
      .order("id", { ascending: false })
      .then(({ data }) => setGarantias(data ?? []));
  }, []);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentWrapper}>
        <Text style={styles.header}>Garantías Guardadas</Text>

        <FlatList
          data={garantias}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
              onPress={() => router.push({ pathname: "/garantia", params: { id: item.id } })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {item.tipo} · {item.marca}
                </Text>
                <Text style={styles.subtitle}>{item.modelo}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{item.importe}€</Text>
              </View>
            </Pressable>
          )}
        />

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    alignItems: "center", // Centra el bloque en la web
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    // --- ESTE ES EL PUNTO INTERMEDIO ---
    maxWidth: 1000, // Ni 320 ni pantalla completa. 850px es ideal para Web/Tablet.
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  listPadding: {
    paddingBottom: 40,
  },
  row: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Sutil sombra
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer",
      },
      default: { elevation: 2 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },
  backButton: {
    paddingVertical: 25,
  },
  backText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
