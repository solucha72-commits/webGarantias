import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { formatFecha } from "@/lib/utils/date";


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
      .select("id,tipo,marca,modelo,importe,duracion_garantia,centro_compra")
      .order("id", { ascending: false })
      .then(({ data }) => setGarantias(data ?? []));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Garantías</Text>

      <FlatList
        data={garantias}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push({ pathname: "/garantia", params: { id: item.id } })}>
            <View>
              <Text style={styles.title}>
                {item.tipo} · {item.marca}
              </Text>
              <Text style={styles.subtitle}>{item.modelo}</Text>
              <Text style={styles.meta}>{item.centro_compra}</Text>
            </View>
            <Text style={styles.price}>{item.importe} €</Text>
          </Pressable>
        )}
      />

      <Text style={styles.back} onPress={() => router.back()}>
        ← Volver
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", padding: 15 },
  header: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  row: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 14, color: "#555" },
  meta: { fontSize: 12, color: "#777" },
  price: { fontSize: 16, fontWeight: "bold", color: "#2563eb" },
  back: { textAlign: "center", marginTop: 15, color: "#2563eb" },
});
